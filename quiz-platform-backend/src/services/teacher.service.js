import sequelize from "../config/sequelizeConfig.js";
import teacherRepo from "../repositories/teacher.repository.js";

const createTeacher = async (data) => {

  return await sequelize.transaction(async (t) => {

    const teacher = await teacherRepo.createTeacher(data, t);

    return teacher;
  });
};

// ✅ GET ALL
const getTeachers = async (page, limit, search) => {

  const result = await teacherRepo.getTeachers(page, limit, search);

  return {
    total: result.count,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(result.count / limit),
    data: result.rows
  };
};

// ✅ GET BY ID
const getTeacherById = async (id) => {

  const teacher = await teacherRepo.getTeacherById(id);

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  return teacher;
};

// ✅ UPDATE
const updateTeacher = async (id, data) => {

  return await sequelize.transaction(async (t) => {

    const teacher = await teacherRepo.getTeacherById(id);

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    const updated = await teacher.update(data, { transaction: t });

    return updated;
  });
};

// ✅ DELETE
const deleteTeacher = async (id) => {

  return await sequelize.transaction(async (t) => {

    const teacher = await teacherRepo.getTeacherById(id);

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    await teacher.destroy({ transaction: t });

    return teacher;
  });
};

export default {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
};