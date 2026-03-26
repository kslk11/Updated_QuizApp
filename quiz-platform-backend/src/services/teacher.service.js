import bcrypt from 'bcrypt';
import sequelize from "../config/sequelizeConfig.js";
import teacherRepo from "../repositories/teacher.repository.js";
import userRepo from "../repositories/userRepo.js";
const createTeacherService = async (data) => {
  const t = await sequelize.transaction();

  try {
    const {
      name,
      email,
      password,
      age,
      client_id,
      specialization,
      experience_years,
      bio,
    } = data;

    const existingUser = await userRepo.findUserByEmail(email,{ transaction: t });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.createUser(
      {
        name,
        email,
        password: hashedPassword,
        age,
        // role_id: 3, 
        role_id: 4, 
      },
      { transaction: t }
    );

    const teacher = await teacherRepo.createTeacher(
      {
        user_id: user.id,
        client_id,
        specialization,
        experience_years,
        bio,
      },
      { transaction: t }
    );

    await t.commit();

    return {
      teacher,
      user,
    };

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// ✅ GET ALL
const getTeachers = async (page, limit, search,client_id) => {

  console.log("ClientID",client_id)
  const result = await teacherRepo.getTeachers(page, limit, search,client_id);
  return {
    total: result.count,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(result.count / limit),
    data: result.rows
  };
};

// ✅ GET BY ID
const getTeacherById = async (id) => {

  const teacher = await teacherRepo.getTeacherById(id);

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  return teacher;
};

// ✅ UPDATE
const updateTeacher = async (id, data) => {

  return await sequelize.transaction(async (t) => {

    const teacher = await teacherRepo.getTeacherById(id);

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    const updated = await teacherRepo.updateTeacher(data, { transaction: t });

    return updated;
  });
};

// ✅ DELETE
const deleteTeacher = async (id) => {

  return await sequelize.transaction(async (t) => {

    const teacher = await teacherRepo.getTeacherById(id);

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    await teacher.destroy({ transaction: t });

    return teacher;
  });
};

export default {
  createTeacherService,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
};