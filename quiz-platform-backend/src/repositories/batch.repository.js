import { Op } from "sequelize";
import models from "../../models/index.js";

const createBatch = async (data, transaction = null) => {
  return await models.Batch.create(data, { transaction });
};

const getBatchById = async (id) => {
  return await models.Batch.findAll({course_id:id});
};

const getBatches = async (page, limit, search = null, course_id, sortOrder = "ASC") => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  if (search) {
    where.name = {
      [Op.like]: `%${search}%`
    };
  }

  if (course_id) {
    where.course_id = course_id;
  }

  const result = await models.Batch.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [["createdAt", sortOrder]]
  });

  return {
    total: result.count,
    data: result.rows,
    currentPage: pageNum,
    totalPages: Math.ceil(result.count / limitNum)
  };
};

// UPDATE
const updateBatch = async (id, data) => {
  const batch = await models.Batch.findByPk(id);
  if (!batch) return null;

  await batch.update(data);
  return batch;
};

// DELETE
const deleteBatch = async (id) => {
  const batch = await models.Batch.findByPk(id);
  if (!batch) return null;

  await batch.destroy();
  return batch;
};

export default {
  createBatch,
  getBatchById,
  getBatches,
  updateBatch,
  deleteBatch
};