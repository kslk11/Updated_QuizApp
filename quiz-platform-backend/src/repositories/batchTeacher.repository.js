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

const getMappings = async ({ where, limit, offset }) => {
  return await models.BatchTeacher.findAndCountAll({
    where,
    include: [
      {
        model: models.Teacher,
        required: true, // 🔥 THIS FIXES null issue
        include: [
          {
            model: models.User,
            attributes: ["id", "name", "email"],
          },
        ],
      },
      {
        model: models.Batch,
        attributes: ["id", "name"],
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
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

// const deleteMapping = async (batch_id, teacher_id, { transaction }) => {
//   return await models.BatchTeacher.destroy({
//     where: { batch_id, teacher_id },
//     transaction,
//   });
// };
const updateMapping = async (id, data, { transaction }) => {
  return await models.BatchTeacher.update(data, {
    where: { id },
    transaction,
  });
};

const findById = async (id) => {
  return await models.BatchTeacher.findOne({
    where: { id },
  });
};

const deleteMapping = async (id, { transaction }) => {
  return await models.BatchTeacher.destroy({
    where: { id },
    transaction,
  });
};
export default {
  createMapping,
  bulkCreateMapping,
  findMapping,
  getByBatchId,
  deleteMapping,
  getMappings,
  updateMapping,
  findById
};