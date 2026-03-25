import sequelize from "../config/sequelizeConfig.js";
import clientRepo from "../repositories/clientRepo.js";
import {
  createCourseRepo,
  deleteCourseRepo,
  findCourseById,
  findCourseByName,
  getCoursesRepo,
  updateCourseRepo,
} from "../repositories/course.repository.js";
export const createCourseService = async (data, user) => {
  const t = await sequelize.transaction();

  try {
    const { name } = data;
    const client  = await clientRepo.findClientByUserId(user.id)
    console.log(client.id)
    const client_id = client.id;
    console.log(client_id)
    const existing = await findCourseByName(name, client_id);
    if (existing) throw new Error("Course already exists");

    const course = await createCourseRepo(
      { name, client_id },
      { transaction: t }
    );

    await t.commit();
    return course;

  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const getCoursesService = async (user, query) => {
  const client_id = user.client_id;

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  const { count, rows } = await getCoursesRepo(client_id, limit, offset);

  return {
    total: count,
    page,
    limit,
    data: rows,
  };
};

export const updateCourseService = async (id, data, user) => {
  const t = await sequelize.transaction();

  try {
    const course = await findCourseById(id, user.client_id, { transaction: t });

    if (!course) throw new Error("Course not found");

    await updateCourseRepo(course, data, { transaction: t });

    await t.commit();
    return course;

  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const deleteCourseService = async (id, user) => {
  const t = await sequelize.transaction();

  try {
    const course = await findCourseById(id, user.client_id, { transaction: t });

    if (!course) throw new Error("Course not found");

    await deleteCourseRepo(course, { transaction: t });

    await t.commit();

  } catch (err) {
    await t.rollback();
    throw err;
  }
};