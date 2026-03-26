import sequelize from "../config/sequelizeConfig.js";
import batchRepo from "../repositories/batch.repository.js";

const createBatch = async (data) => {
  return await sequelize.transaction(async (t) => {
    return await batchRepo.createBatch(data, t);
  });
};

const getBatches = async (page, limit, search, course_id, sortOrder) => {
  return await batchRepo.getBatches(page, limit, search, course_id, sortOrder);
};

const getBatchById = async (course_id, page, limit) => {
  const result = await batchRepo.getBatchById(course_id, page, limit);

  if (!result.data.length) {
    throw new Error("No batches found");
  }

  return result;
};

const updateBatch = async (id, data) => {
  return await sequelize.transaction(async (t) => {
    const batch = await batchRepo.getBatchById(id);

    if (!batch) throw new Error("Batch not found");

    return await batch.update(data, { transaction: t });
  });
};

const deleteBatch = async (id) => {
  return await sequelize.transaction(async (t) => {
    const batch = await batchRepo.getBatchById(id);

    if (!batch) throw new Error("Batch not found");

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