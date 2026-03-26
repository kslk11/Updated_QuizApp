import { Op } from "sequelize";
import models from "../../models/index.js";

const createBatch = async (data, transaction = null) => {
  return await models.Batch.create(data, { transaction });
};

const getBatchById = async (course_id, page = 1, limit = 10) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  const result = await models.Batch.findAndCountAll({
    where: { course_id },   // ✅ FIX
    limit: limitNum,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return {
    total: result.count,
    data: result.rows,
    currentPage: pageNum,
    totalPages: Math.ceil(result.count / limitNum)
  };
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
const updateBatch = async (batch, data, transaction = null) => {
  return await batch.update(data, { transaction });
};

// DELETE (optional)
const deleteBatch = async (batch, transaction = null) => {
  return await batch.destroy({ transaction });
};

export default {
  createBatch,
  getBatchById,
  getBatches,
  updateBatch,
  deleteBatch
};