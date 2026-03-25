import {
  createCourseService,
  deleteCourseService,
  getCoursesService,
  updateCourseService,
} from "../services/course.service.js";

export const createCourse = async (req, res) => {
  try {
    const result = await createCourseService(req.body, req.user);
    res.status(201).json({
      success: true,
      message: "Course created",
      data: result,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    const result = await getCoursesService(req.user, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const result = await updateCourseService(
      req.params.id,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Course updated",
      data: result,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    await deleteCourseService(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: "Course deleted",
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};