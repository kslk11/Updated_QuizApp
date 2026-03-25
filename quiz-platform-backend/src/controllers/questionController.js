import models from "../../models/index.js";
import questionService from "../services/questionService.js";

const createQuestion = async (req, res) => {

  try {

    const quizId = req.params.id;

    const quiz = await models.Quiz.findByPk(quizId);

    if (!quiz) {

      return res.status(404).json({
        success: false,
        message: "Quiz does not exist"
      });

    }

    const question = await questionService.createQuestion(req.body, quizId);

    return res.status(201).json({
      success: true,
      data: question
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


const getQuestions = async (req, res) => {

  try {

    const quizId = req.params.quizId;

    const questions = await questionService.getQuestions(quizId);

    return res.status(200).json({
      success: true,
      data: questions
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
const updateQuestion = async (req, res) => {

  try {

    const questionId = req.params.id;
    console.log(questionId)
    const clientId = req.user.id;
    const data = req.body;

    const question = await questionService.updateQuestion(
      clientId,
      questionId,
      data
    );

    res.json({
      success: true,
      message: "Question updated successfully",
      data: question
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

};
const countQuestions = async(req,res)=>{
  try {
    const {id} = req.params
    console.log(id)
    const totalQuestions = await models.Question.findAndCountAll({where:{
      quiz_id :id
    }})
      res.json(totalQuestions);  
  } catch (error) {
     res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
const deleteQuestion = async (req, res) => {

  try {

    const questionId = req.params.id;
    const clientId = req.user.id;

    const result = await questionService.deleteQuestion(
      clientId,
      questionId
    );

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }

};
export default {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  countQuestions
};