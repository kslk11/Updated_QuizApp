import clientRepo from "../repositories/clientRepo.js";
import teacherService from "../services/teacher.service.js";

const createTeacher = async (req, res) => {
  try {

      const client_id = await clientRepo.findClientByUserId(req.user.id)
      const data = {
        ...req.body,
        client_id:client_id.id
      }
    const teacher = await teacherService.createTeacher(data);
    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getTeachers = async (req, res) => {
  try {

    const { page = 1, limit = 10, search = null } = req.query;

    const teachers = await teacherService.getTeachers(page, limit, search);

    return res.status(200).json({
      success: true,
      message: "Teachers fetched successfully",
      ...teachers
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getTeacherById = async (req, res) => {
  try {

    const teacher = await teacherService.getTeacherById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Teacher fetched successfully",
      data: teacher
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const updateTeacher = async (req, res) => {
  try {

    const teacher = await teacherService.updateTeacher(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const deleteTeacher = async (req, res) => {
  try {

    await teacherService.deleteTeacher(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Teacher deleted successfully"
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
};