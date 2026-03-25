import models from "../../models/index.js";
import sequelize from "../config/sequelizeConfig.js";
import questionRepo from "../repositories/questionRepo.js";

const createQuestion = async (data, quizId) => {

  const transaction = await sequelize.transaction();

  try {

    const question = await questionRepo.createQuestion(
      {
        quiz_id: quizId,
        question: data.question,
        option_a: data.option_a,
        option_b: data.option_b,
        option_c: data.option_c,
        option_d: data.option_d,
        correct_answer: data.correct_answer,
        marks: data.marks
      },
      transaction
    );

    await transaction.commit();

    return question;

  } catch (error) {

    await transaction.rollback();
    throw error;

  }

};



const getQuestions = async (quizId) => {
const questions = await questionRepo.getQuestions(quizId);

  return {
    data: questions
  };

};
const updateQuestion = async (clientId, questionId, data) => {

  const transaction = await sequelize.transaction();

  try {

    const question = await models.Question.findOne({
      where: {
        id: questionId,
      },
      transaction
    });

    if (!question) throw new Error("Question not found");

    await question.update({
      question: data.question,
      option_a: data.option_a,
      option_b: data.option_b,
      option_c: data.option_c,
      option_d: data.option_d,
      correct_answer: data.correct_answer,
      marks: data.marks
    }, { transaction });

    await transaction.commit();

    return question;

  } catch (error) {

    await transaction.rollback();
    throw error;

  }

};

const deleteQuestion = async (clientId, questionId) => {

  const transaction = await sequelize.transaction();

  try {

    const question = await models.Question.findOne({
      where: {
        id: questionId,
      },
      transaction
    });

    if (!question) throw new Error("Question not found");

    await question.destroy({ transaction });

    await transaction.commit();

    return { message: "Question deleted successfully" };

  } catch (error) {

    await transaction.rollback();
    throw error;

  }

};
export default {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion
};