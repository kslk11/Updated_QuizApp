import models from "../../models/index.js";
import quizService from "../services/quizService.js";

const createQuiz = async (req, res) => {

  try {

    const bundle = await models.Bundle.findByPk(req.body.categoryId);

    if (!bundle) {

      return res.status(404).json({
        success: false,
        message: "Bundle not found"
      });

    }

    const quiz = await quizService.createQuiz(req.body, bundle.id);
    console.log(quiz);
    return res.status(201).json({
      success: true,
      data: quiz
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
const getQuizzesBybundleId = async(req,res)=>{
  try {
      const {id} = req.params
const quiz = await quizService.getQuizzesBybundleId(id)
 return res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

const getQuizzes = async (req, res) => {

  try {

    const bundleId = req.params.bundleId;

    const quizzes = await quizService.getQuizzes(req.query, bundleId);

    return res.status(200).json({
      success: true,
      data: quizzes
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const quiz = await quizService.updateQuiz(id, data);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    return res.json({
      success: true,
      message: "Quiz updated successfully",
      data: quiz
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await quizService.deleteQuiz(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    return res.json({
      success: true,
      message: "Quiz deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export default {
  createQuiz,
  getQuizzes,
  updateQuiz,deleteQuiz,
  getQuizzesBybundleId
};