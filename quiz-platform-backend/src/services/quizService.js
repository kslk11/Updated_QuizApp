import sequelize from "../config/sequelizeConfig.js";
import quizRepo from "../repositories/quizRepo.js";

const createQuiz = async (data, bundleId) => {

  const transaction = await sequelize.transaction();
  try {

    const quiz = await quizRepo.createQuiz(
      {
        bundle_id: bundleId,
        title: data.title,
        duration: data.duration,
        total_marks: data.totalMarks
      },
      transaction
    );

    await transaction.commit();

    return quiz;

  } catch (error) {

    await transaction.rollback();
    throw error;

  }

};

// <<<<<<< v
// =======
const getQuizzesBybundleId = async (id)=>{
  return quizRepo.getQuizzesBybundleId(id)
}
// >>>>>>> main
const getQuizzes = async (query, bundleId) => {

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 6;
  const search = query.search || "";

  const result = await quizRepo.getQuizzes(bundleId, page, limit, search);

  return {
    totalRecords: result.count,
    totalPages: Math.ceil(result.count / limit),
    currentPage: page,
    quizzes: result.rows
  };

//   return {
//   data: {
//     totalRecords: result.count,
//     totalPages: Math.ceil(result.count / limit),
//     currentPage: page,
//     quizzes: result.rows
//   }
// };

};
const updateQuiz = async (id, data) => {
// <<<<<<< v
//   console.log(data);
// =======
//   console.log(data)
// >>>>>>> main
  return await quizRepo.updateQuiz(id, data);
};
const deleteQuiz = async (id) => {
  return await quizRepo.deleteQuiz(id);
};
export default {
  createQuiz,
  getQuizzes,
  updateQuiz,deleteQuiz,
  getQuizzesBybundleId
};