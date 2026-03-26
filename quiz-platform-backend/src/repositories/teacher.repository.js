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

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  if (search) {
    where.name = {
      [Op.like]: `%${search}%`
    };
  }

  const result = await models.Teacher.findAndCountAll({
    where,
    limit:limitNum,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return result;
};

const updateTeacher = async (id, data) => {

  const teacher = await models.Teacher.findByPk(id);
  const user =  await models.User.findOne({where:{
    user_id:id
  }})
  console.log(user)
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