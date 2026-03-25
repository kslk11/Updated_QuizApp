import { col, fn } from "sequelize";
import models from "../../models/index.js";

const getDashboardStats = async () => {

  const totalStudents = await models.Student.count({
    where: {}
  });

  const totalClients = await models.Client.count({
    where: {  }
  });

  const totalQuizzes = await models.Quiz.count({
    where: {  }
  });

  const totalAttempts = await models.QuizAttempt.count();

  const avgScoreResult = await models.QuizAttempt.findOne({
    attributes: [
      [fn("AVG", col("score")), "average_score"]
    ]
  });

  const averageScore = Number(avgScoreResult?.dataValues?.average_score || 0).toFixed(2);

  return {
    total_students: totalStudents,
    total_clients: totalClients,
    total_quizzes: totalQuizzes,
    total_attempts: totalAttempts,
    average_score: averageScore
  };

};

export default {
  getDashboardStats
};