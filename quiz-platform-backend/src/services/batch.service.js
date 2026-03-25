import sequelize from "../config/sequelizeConfig.js";
import batchRepo from "../repositories/batch.repository.js";

const createBatch = async (data) => {

  return await sequelize.transaction(async (t) => {
    const batch = await batchRepo.createBatch(data, t);

    return batch;
  });
};

const getBatches = async (page, limit, search) => {

  const result = await batchRepo.getBatches(page, limit, search);

  return {
    total: result.count,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(result.count / limit),
    data: result.rows
  };
};

const getBatchById = async (id) => {

  const batch = await batchRepo.getBatchById(id);

  if (!batch) {
    throw new Error("Batch not found");
  }

  return batch;
};

const updateBatch = async (id, data) => {

  return await sequelize.transaction(async (t) => {

    const batch = await batchRepo.getBatchById(id);

    if (!batch) {
      throw new Error("Batch not found");
    }

    const updated = await batch.update(data, { transaction: t });

    return updated;
  });
};

const deleteBatch = async (id) => {

  return await sequelize.transaction(async (t) => {

    const batch = await batchRepo.getBatchById(id);

    if (!batch) {
      throw new Error("Batch not found");
    }

    await batch.destroy({ transaction: t });

    return batch;
  });
};

export default {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch
};