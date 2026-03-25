import models from "../../models/index.js";

const createStudent = async (data, transaction = null) => {

  return await models.Student.create(data, { transaction });

};

const findStudentByUserId = async (userId) => {

  return await models.Student.findOne({
    where: { user_id: userId }
  });

};
const updateStudent = async (id, data) => {

  const student = await models.Student.findOne({
    where: {
      id,
      is_deleted: false
    }
  });

  if (!student) return null;

  await student.update(data);

  return student;
};

const deleteStudent = async (id) => {

  const student = await models.Student.findOne({
    where: {
      id,
      is_deleted: false
    }
  });

  if (!student) return null;

  await student.update({
    is_deleted: true
  });

  return student;
};
export default {
  createStudent,
  findStudentByUserId,
  updateStudent,
  deleteStudent
};