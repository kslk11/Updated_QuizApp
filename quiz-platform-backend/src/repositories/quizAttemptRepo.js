import models from "../../models/index.js";

const startQuiz = async (data, transaction = null) => {

  return await models.QuizAttempt.create(data, { transaction });

};

const findAttemptById = async (id) => {

  return await models.QuizAttempt.findByPk(id);

};

const updateAttempt = async (id, data, transaction = null) => {

  return await models.QuizAttempt.update(
    data,
    {
      where: { id },
      transaction
    }
  );

};

export default {
  startQuiz,
  findAttemptById,
  updateAttempt
};