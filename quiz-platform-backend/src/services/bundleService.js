import sequelize from "../config/sequelizeConfig.js";
import bundleRepo from "../repositories/bundleRepo.js";

const createBundle = async (data, clientId) => {

  const transaction = await sequelize.transaction();

  try {

    const bundle = await bundleRepo.createBundle(
      {
        client_id: clientId,
        title: data.title,
        description: data.description
      },
      transaction
    );

    await transaction.commit();

    return bundle;

  } catch (error) {

    await transaction.rollback();
    throw error;

  }

};



const getBundles = async (query, id) => {

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 6;
  const search = query.search || "";

  const result = await bundleRepo.getBundles(page, limit, search, id);

  return {
    totalRecords: result.count,
    totalPages: Math.ceil(result.count / limit),
    currentPage: page,
    bundles: result.rows
  };

};
const getBundlesWithoutAuth = async (query) => {

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 6;
  const search = query.search || "";

  const result = await bundleRepo.getBundlesWithoutAuth(page, limit, search);

  return {
    totalRecords: result.count,
    totalPages: Math.ceil(result.count / limit),
    currentPage: page,
    bundles: result.rows
  };

};
const updateBundle = async (id, data) => {
  return await bundleRepo.updateBundle(id, data);
};
const deleteBundle = async (id) => {
  return await bundleRepo.deleteBundle(id);
};
export default {
  createBundle,
  getBundles,updateBundle,
  deleteBundle,
  getBundlesWithoutAuth
};