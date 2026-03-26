import models from "../../models/index.js";

const createMapping = async (data, { transaction }) => {
  return await models.BatchTeacher.create(data, { transaction });
};

const bulkCreateMapping = async (data, { transaction }) => {
  return await models.BatchTeacher.bulkCreate(data, {
    transaction,
    ignoreDuplicates: true, // avoids unique constraint error
  });
};

const findMapping = async (batch_id, teacher_id) => {
  return await models.BatchTeacher.findOne({
    where: { batch_id, teacher_id },
  });
};

const getByBatchId = async (batch_id) => {
  return await models.BatchTeacher.findAll({
    where: { batch_id },
    include: [
      {
        model: models.Teacher,
      },
    ],
  });
};

const deleteMapping = async (batch_id, teacher_id, { transaction }) => {
  return await models.BatchTeacher.destroy({
    where: { batch_id, teacher_id },
    transaction,
  });
};

export default {
  createMapping,
  bulkCreateMapping,
  findMapping,
  getByBatchId,
  deleteMapping,
};