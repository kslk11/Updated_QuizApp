import { Op } from "sequelize";
import models from "../../models/index.js";

const createQuiz = async (data, transaction = null) => {

  return await models.Quiz.create(data, { transaction });

};

const getQuizzesBybundleId = async(id)=>{
  console.log("repoId",id)
      return await models.Quiz.findByPk(id)
}
const getQuizzes = async (bundleId, page = 1, limit = 10, search = null) => {

  const offset = (page - 1) * limit;

  const where = {
    bundle_id: bundleId,
    is_deleted:false
  };

  if (search) {

    where.title = {
      [Op.like]: `%${search}%`
    };

  }

  const result = await models.Quiz.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return result;

};
const updateQuiz = async (id, data) => {

  const quiz = await models.Quiz.findOne({
    where: {
      id,
      is_deleted: false
    }
  });

  if (!quiz) return null;
console.log(quiz);
  await quiz.update(data);

  return quiz;
};
const deleteQuiz = async (id) => {
console.log("firstid",id)
  const quiz = await models.Quiz.findOne({
    where: {
      id,
      is_deleted: false
    }
  });
console.log(quiz)
  if (!quiz) return null;

  await quiz.update({
    is_deleted: true
  });

  return quiz;
};

export default {
  createQuiz,
  getQuizzes,
  updateQuiz,
  deleteQuiz,
  getQuizzesBybundleId
};