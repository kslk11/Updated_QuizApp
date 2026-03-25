import models from "../../models/index.js";

export const createCourseRepo = (data, options = {}) => {
  return models.Course.create(data, options);
};

export const findCourseByName = (name, client_id) => {
  return models.Course.findOne({
    where: { name, client_id },
  });
};

export const getCoursesRepo = (client_id, limit, offset) => {
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
  return models.Course.update(data, options);
};

export const deleteCourseRepo = (course, options = {}) => {
  return models.Course.destroy(options);
};