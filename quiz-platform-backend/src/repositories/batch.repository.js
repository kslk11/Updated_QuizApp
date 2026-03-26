import { Op } from "sequelize";
import models from "../../models/index.js";

const createBatch = async (data, transaction = null) => {
  return await models.Batch.create(data, { transaction });
};

const getBatchById = async (id) => {
  console.log("repoBatchId", id);

  return await models.Batch.findByPk(id); 
};

const getBatches = async (page = 1, limit = 10, search = null) => {

  const offset = (page - 1) * limit;

  const where = {};

  if (search) {
    where.name = {
      [Op.like]: `%${search}%`
    };
  }

  const result = await models.Batch.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return result;
};

// ✅ UPDATE BATCH
const updateBatch = async (id, data) => {

  const batch = await models.Batch.findByPk(id);

  if (!batch) return null;

  console.log(batch);

  await batch.update(data);

  return batch;
};

// ✅ DELETE BATCH (SOFT DELETE via paranoid)
const deleteBatch = async (id) => {

  console.log("deleteBatchId", id);

  const batch = await models.Batch.findByPk(id);

  if (!batch) return null;

  await batch.destroy(); 
  // 👈 this sets deletedAt instead of deleting row

  return batch;
};

export default {
  createBatch,
  getBatchById,
  getBatches,
  updateBatch,
  deleteBatch
};