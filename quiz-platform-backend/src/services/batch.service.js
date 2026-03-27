import models from "../../models/index.js";
import sequelize from "../config/sequelizeConfig.js";
import batchRepo from "../repositories/batch.repository.js";
import batchTeacherRepository from "../repositories/batchTeacher.repository.js";

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

    const [updatedCount] = await models.Batch.update(data, {
      where: { id },   // ✅ MOST IMPORTANT
      transaction: t
    });

    if (updatedCount === 0) {
      throw new Error("Batch not found");
    }

    // optional: return updated data
    return await models.Batch.findByPk(id, { transaction: t });
  });
};

const deleteBatch = async (id) => {
  return await sequelize.transaction(async (t) => {

    const deletedCount = await models.Batch.destroy({
      where: { id },   // ✅ MOST IMPORTANT
      transaction: t
    });

    if (deletedCount === 0) {
      throw new Error("Batch not found");
    }

    return true;
  });
};
const getBatchByTeacherId = async (userId) => {
  return await batchTeacherRepository.getBatchByTeacherId(userId);
};
export default {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getBatchByTeacherId
};