import { Op } from "sequelize";
import models from "../../models/index.js";

const createBundle = async (data, transaction = null) => {

  return await models.Bundle.create(data, { transaction });

};

const getBundles = async (page = 1, limit = 6, search = null, id) => {

  const offset = (page - 1) * limit;

  const where = {
    client_id: id,
    is_deleted:false
  };

  if (search) {
    where.title = {
      [Op.like]: `%${search}%`
    };
  }

  const result = await models.Bundle.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return result;

};
const getBundlesWithoutAuth = async (page = 1, limit = 6, search = null) => {

  const offset = (page - 1) * limit;

  const where = {is_deleted:false};

  if (search) {
    where.title = {
      [Op.like]: `%${search}%`
    };
  }

  const result = await models.Bundle.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return result;

};
const updateBundle = async (id, data) => {

  const bundle = await models.Bundle.findOne({
    where: {
      id,
      is_deleted: false
    }
  });

  if (!bundle) return null;

  await bundle.update(data);

  return bundle;
};
const deleteBundle = async (id) => {

  const bundle = await models.Bundle.findOne({
    where: {
      id,
      is_deleted: false
    }
  });

  if (!bundle) return null;

  await bundle.update({
    is_deleted: true
  });

  return bundle;
};

export default {
  createBundle,
  getBundles,
  updateBundle,
  deleteBundle,
  getBundlesWithoutAuth
};