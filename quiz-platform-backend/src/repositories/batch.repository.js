import { Op } from "sequelize";
import models from "../../models/index.js";

const createBatch = async (data, transaction = null) => {
  return await models.Batch.create(data, { transaction });
};

const getBatchById = async (id) => {
  console.log("repoBatchId", id);

  return await models.Batch.findByPk(id); 
};


// ✅ GET ALL BATCHES (PAGINATION + SEARCH)
// const getBatches = async (page = 1, limit = 10, search = null) => {


//   const offset = (page - 1) * limit;

//   const where = {};

//   if (search) {
//     where.name = {
//       [Op.like]: `%${search}%`
//     };
//   }

//   const result = await models.Batch.findAndCountAll({
//     where,
//     limit,
//     offset,
//     order: [["createdAt", "DESC"]]
//   });

//   return result;
// };
const getBatches = async (page, limit, search = null, course_id, sortOrder = 'ASC') => {
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

  const batches = await models.Batch.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['createdAt', sortOrder]]
  });

  return {
    total: batches.count,
    data: batches.rows,
    currentPage: pageNum,
    totalPages: Math.ceil(batches.count / limitNum)
  };
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