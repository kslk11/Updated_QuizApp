import models from "../../models/index.js";

const createQuestion = async (data, transaction = null) => {

  return await models.Question.create(data, { transaction });

};

const getQuestions = async (quizId) => {

  return await models.Question.findAll({
    where: { quiz_id: quizId },
    order: [["createdAt", "DESC"]]
  });

};
const createQuestionsBulk = async (dataArray, transaction = null) => {
  return await models.Question.bulkCreate(dataArray, { transaction });
};

export default {
  createQuestion,
  getQuestions,
  createQuestionsBulk
};