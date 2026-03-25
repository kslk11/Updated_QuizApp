import models from "../../models/index.js";

const findUserByEmail = async (email, transaction = null) => {
  return await models.User.findOne({
    where: { email },
    transaction
  });
};

const createUser = async (data, transaction = null) => {
  return await models.User.create(data, { transaction });
};

export default {
  findUserByEmail,
  createUser
};