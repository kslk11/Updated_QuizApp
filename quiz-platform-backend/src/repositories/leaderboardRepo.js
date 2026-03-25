import { Op, col, fn } from "sequelize";
import models from "../../models/index.js";

const getLeaderboard = async (quizId) => {

  const attempts = await models.QuizAttempt.findAll({

    where: {
      quiz_id: quizId,
      submitted_at: {
        [Op.ne]: null
      }
    },

    attributes: [
      "student_id",
      [fn("MAX", col("score")), "score"],
      [fn("MIN", col("submitted_at")), "submitted_at"]
    ],

    include: [
      {
        model: models.Student,
        as: "Student",
        attributes: ["id", "name"]
      }
    ],

    group: ["student_id", "Student.id"],

    order: [
      [fn("MAX", col("score")), "DESC"],
      [fn("MIN", col("submitted_at")), "ASC"]
    ]

  });

  return attempts;

};

const getTopStudents = async () => {

  const students = await models.QuizAttempt.findAll({

    attributes: [
      "student_id",
      [fn("SUM", col("score")), "total_score"],
      [fn("COUNT", col("QuizAttempt.id")), "total_attempts"]
    ],

    include: [
      {
        model: models.Student,
        as: "Student",
        attributes: ["id", "name"]
      }
    ],

    where: {
      submitted_at: {
        [Op.ne]: null
      }
    },

    group: ["student_id", "Student.id"],

    order: [[fn("SUM", col("score")), "DESC"]],

    limit: 5

  });

  return students;

};
export default {
  getLeaderboard,
  getTopStudents
};