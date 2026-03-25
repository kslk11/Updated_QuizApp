import models from "../../models/index.js";
import studentService from "../services/studentService.js";


const registerStudent = async (req, res) => {
  try {
    const student = await studentService.registerStudent(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const startQuiz = async (req, res) => {
  try {
    const attempt = await studentService.startQuiz(req.user.id, req.params.id);
    res.status(201).json({ success: true, attempt_id: attempt.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const { id }      = req.params;   // attempt_id from URL

    const score = await studentService.submitQuiz(id, answers);

    res.status(200).json({ success: true, score });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getQuestions = async (req, res) => {
  try {
    const questions = await models.Question.findAll({
      where: { quiz_id: req.params.id },
      attributes: [
        "id", "question",
        "option_a", "option_b", "option_c", "option_d"
        // NOTE: correct_answer is intentionally excluded — never send to frontend
      ]
    });

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getResult = async (req, res) => {
  try {
    const result = await studentService.getResult(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const student = await studentService.updateStudent(id, data);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.json({
      success: true,
      message: "Student updated successfully",
      data: student
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await studentService.deleteStudent(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.json({
      success: true,
      message: "Student deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getAttemptHistory = async (req, res) => {
  try {
    const history = await studentService.getAttemptHistory(req.user.id);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const leaderboard = async (req, res) => {

  try {

    const { quizId } = req.params;

    const data = await studentService.leaderboard(quizId);

    res.json({
      success: true,
      data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
const getTopStudents = async (req, res) => {

  try {

    const data = await studentService.getTopStudents();

    res.json({
      success: true,
      data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
export default {
  registerStudent,
  startQuiz,
  submitQuiz,
  getQuestions,
  getResult,
  deleteStudent,
  updateStudent,
  getAttemptHistory,
  leaderboard,
  getTopStudents
};