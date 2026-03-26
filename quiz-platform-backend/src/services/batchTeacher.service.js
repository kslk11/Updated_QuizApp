import sequelize from "../config/sequelizeConfig.js";
import batchTeacherRepo from "../repositories/batchTeacher.repository.js";
import models from "../../models/index.js";
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

const getAllMappings = async (query, user) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  let where = {};

  // 🔐 Client-based filtering (important for multi-tenant)
  if (user?.id) {
    where.client_id = user.client_id; // or fetch from DB like earlier
  }

  // 🔍 Optional filters
  if (query.batch_id) {
    where.batch_id = query.batch_id;
  }

  if (query.teacher_id) {
    where.teacher_id = query.teacher_id;
  }

  const { count, rows } = await batchTeacherRepo.getMappings({
    where,
    limit,
    offset,
  });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data: rows,
  };
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
const updateBatchTeacher = async (id, data, client_id) => {
  const transaction = await sequelize.transaction();

  try {
    const existing = await batchTeacherRepo.findById(id);

    if (!existing) {
      throw new Error("Mapping not found");
    }

    // 🔐 Client validation
    if (existing.client_id !== client_id) {
      throw new Error("Unauthorized access");
    }

    // ✅ Optional: validate teacher if updating
    if (data.teacher_id) {
      const teacher = await models.Teacher.findOne({
        where: { id: data.teacher_id },
      });

      if (!teacher) {
        throw new Error("Teacher not found");
      }

      if (teacher.client_id !== client_id) {
        throw new Error("Teacher does not belong to this client");
      }
    }

    await batchTeacherRepo.updateMapping(id, data, { transaction });

    const updated = await batchTeacherRepo.findById(id);

    await transaction.commit();
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteBatchTeacher = async (id, client_id) => {
  const transaction = await sequelize.transaction();

  try {
    const existing = await batchTeacherRepo.findById(id);

    if (!existing) {
      throw new Error("Mapping not found");
    }

    // 🔐 Client validation
    if (existing.client_id !== client_id) {
      throw new Error("Unauthorized access");
    }

    await batchTeacherRepo.deleteMapping(id, { transaction });

    await transaction.commit();
    return true;
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
  getAllMappings,
  deleteBatchTeacher,
  updateBatchTeacher
};
