import models from "../../models/index.js";

const createClient = async (data, transaction = null) => {

  return await models.Client.create(data, { transaction });

};

const findClientByUserId = async (userId) => {

  return await models.Client.findOne({
    where: { user_id: userId }
  });

};

export default {
  createClient,
  findClientByUserId
};