import models from "../../models/index.js";

export const createCourseRepo = (data, options = {}) => {
  return models.Course.create(data, options);
};

export const findCourseByName = (name, client_id) => {
  return models.Course.findOne({
    where: { name, client_id },
  });
};

export const getCoursesRepo = async (client_id, limit, offset) => {
  console.log("client_id:", client_id);

  const all = await models.Course.findAll({ paranoid: false });
  console.log("ALL COURSES:", all);

  const filtered = await models.Course.findAll({
    where: { client_id },
  });

  console.log("FILTERED:", filtered);

  return models.Course.findAndCountAll({
    where: { client_id },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

export const findCourseById = (id, client_id, options = {}) => {
  return models.Course.findOne({
    where: { id, client_id },
    ...options,
  });
};

export const updateCourseRepo = (course, data, options = {}) => {
  return course.update(data, options);
};
export const deleteCourseRepo = (course, options = {}) => {
  return course.destroy(options);
};