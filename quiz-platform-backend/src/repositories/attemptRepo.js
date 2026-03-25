import models from "../../models/index.js";

const getAttemptHistory = async (studentId) => {

  const attempts = await models.QuizAttempt.findAll({

    where: {
      student_id: studentId
    },

    include: [
      {
        model: models.Quiz,
        as: "Quiz",
        attributes: ["id", "title"]
      }
    ],

    order: [["submitted_at", "DESC"]]

  });

  return attempts;
};

export default {
  getAttemptHistory
};