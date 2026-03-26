import sequelize from "../config/sequelizeConfig.js";
import batchTeacherRepo from "../repositories/batchTeacher.repository.js";

const assignTeacherToBatch = async (data) => {
  const transaction = await sequelize.transaction();
  try {
    const existing = await batchTeacherRepo.findMapping(
      data.batch_id,
      data.teacher_id,
    );

    if (existing) {
      throw new Error("Teacher already assigned to this batch");
    }
    const mapping = await batchTeacherRepo.createMapping(data, { transaction });

    await transaction.commit();
    return mapping;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const assignMultipleTeachers = async (batch_id, teacherIds, client_id) => {
  const transaction = await sequelize.transaction();

  try {
    const payload = teacherIds.map((teacher_id) => ({
      batch_id,
      teacher_id,
      client_id,
    }));

    await batchTeacherRepo.bulkCreateMapping(payload, { transaction });

    const mappings = await batchTeacherRepo.getByBatchId(batch_id);

    await transaction.commit();

    return mappings;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getTeachersByBatch = async (batch_id) => {
  return await batchTeacherRepo.getByBatchId(batch_id);
};

const removeTeacherFromBatch = async (batch_id, teacher_id) => {
  const transaction = await sequelize.transaction();

  try {
    const deleted = await batchTeacherRepo.deleteMapping(batch_id, teacher_id, {
      transaction,
    });

    await transaction.commit();
    return deleted;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  assignTeacherToBatch,
  assignMultipleTeachers,
  getTeachersByBatch,
  removeTeacherFromBatch,
};
