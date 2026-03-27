import models from "../../models/index.js";

const findUserByEmail = async (email, options = {}) => {
  return await models.User.findOne({
    where: { email },
    ...options,
  });
};

const createUser = async (data, options = {}) => {
  return await models.User.create(data, options);
};
const getUserById = async (id, transaction) => {
  return await models.User.findByPk(id, { transaction });
};

const updateUser = async (id, data, transaction) => {
  return await models.User.update(data, {
    where: { id },
    transaction
  });
};
export default {
  findUserByEmail,
  createUser,
  getUserById,
  updateUser
};