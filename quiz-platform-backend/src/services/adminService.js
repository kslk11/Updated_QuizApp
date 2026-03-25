import bcrypt from "bcrypt";
import models from "../../models/index.js";
import sequelize from "../config/sequelizeConfig.js";
import clientRepo from "../repositories/clientRepo.js";
import dashboardRepo from "../repositories/dashboardRepo.js";
import userRepo from "../repositories/userRepo.js";
import sendEmail from "../utils/mailer.js";
const createClient = async (data) => {

  const transaction = await sequelize.transaction();

  try {

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepo.createUser(
      {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role_id: 2
      },
      transaction
    );

    const client = await clientRepo.createClient(
      {
        user_id: user.id,
        company_name: data.company_name,
        contact_number: data.contact_number
      },
      transaction
    );

//     await sendEmail(
//   user.email,
//   "Your Quiz Platform Account",
//   `
//   <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
//     <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:30px;">

//       <h2 style="color:#2c3e50;">Client Account Created ✅</h2>

//       <p style="font-size:16px; color:#555;">
//         Hello <strong>${user.name}</strong>,
//       </p>

//       <p style="font-size:15px; color:#555;">
//         Your account has been created successfully on the Quiz Platform.
//         You can now manage students, bundles, and quizzes.
//       </p>

//       <div style="background:#f1f3f5; padding:15px; border-radius:6px; margin:20px 0;">
//         <p style="margin:5px 0;"><strong>Email:</strong> ${user.email}</p>
//         <p style="margin:5px 0;"><strong>Password:</strong> ${data.password}</p>
//       </div>

//       <p style="font-size:14px; color:#e74c3c;">
//         ⚠ Please change your password after logging in for security.
//       </p>

//       <div style="text-align:center; margin:25px 0;">
//         <a href="http://localhost:3000/login"
//            style="background:#27ae60; color:white; padding:12px 25px; text-decoration:none; border-radius:5px;">
//            Login to Dashboard
//         </a>
//       </div>

//       <hr style="margin:25px 0;">

//       <p style="font-size:13px; color:#999;">
//         Quiz Platform Team
//       </p>

//     </div>
//   </div>
//   `
// );
    await transaction.commit();

    return client;

  } catch (error) {

    await transaction.rollback();
    throw error;

  }

};

const getDashboard = async () => {

  const stats = await dashboardRepo.getDashboardStats();

  return stats;

};
const updateClient = async (clientId, data) => {

  const transaction = await sequelize.transaction();

  try {

    const client = await models.Client.findByPk(clientId, { transaction });

    if (!client) throw new Error("Client not found");

    const user = await models.User.findByPk(client.user_id, { transaction });

    if (!user) throw new Error("User not found");

    // update client table
    await client.update(
      {
        company_name: data.company_name,
        contact_number: data.contact_number
      },
      { transaction }
    );

    await user.update(
      {
        name: data.name,
        email: data.email
      },
      { transaction }
    );

    await transaction.commit();

    return {
      client,
      user
    };

  } catch (error) {

    await transaction.rollback();
    throw error;

  }
};

const deleteClient = async (clientId) => {

  const transaction = await sequelize.transaction();

  try {

    const client = await models.Client.findByPk(clientId, { transaction });

    if (!client) throw new Error("Client not found");

    const user = await models.User.findByPk(client.user_id, { transaction });

    if (!user) throw new Error("User not found");

    // soft delete client
    await client.destroy({ transaction });

    // optional: soft delete user as well
    await user.destroy({ transaction });

    await transaction.commit();

    return { message: "Client deleted successfully" };

  } catch (error) {

    await transaction.rollback();
    throw error;

  }
};
export default {
  createClient,
  getDashboard,
  deleteClient,updateClient
};