import { Op } from "sequelize";
import models from "../../models/index.js";

const createTeacher = (data, options = {}) => {
  return models.Teacher.create(data, options);
};

const getTeacherById = async (id) => {
  console.log("repoTeacherId", id);

  return await models.Teacher.findByPk(id);
};

const getTeachers = async (page = 1, limit = 10, search = null) => {

  const offset = (page - 1) * limit;

  const where = {};

  if (search) {
    where.name = {
      [Op.like]: `%${search}%`
    };
  }

  const result = await models.Teacher.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return result;
};

const updateTeacher = async (id, data) => {

  const teacher = await models.Teacher.findByPk(id);

  if (!teacher) return null;

  console.log(teacher);

  await teacher.update(data);

  return teacher;
};

const deleteTeacher = async (id) => {

  console.log("deleteTeacherId", id);

  const teacher = await models.Teacher.findByPk(id);

  if (!teacher) return null;

  await teacher.destroy(); 

  return teacher;
};

export default {
  createTeacher,
  getTeacherById,
  getTeachers,
  updateTeacher,
  deleteTeacher
};