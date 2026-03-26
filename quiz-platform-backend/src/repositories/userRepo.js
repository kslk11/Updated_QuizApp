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

export default {
  findUserByEmail,
  createUser
};