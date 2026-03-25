import express from "express";
import bundleController from "../controllers/bundleController.js";
import questionController from "../controllers/questionController.js";
import quizController from "../controllers/quizController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/bundle",
  authMiddleware,
  roleMiddleware(2),
  bundleController.createBundle
);

router.get(
  "/bundle",
  authMiddleware,
  // roleMiddleware(2),
  bundleController.getBundles
);
router.put("/bundle/:id",authMiddleware, bundleController.updateBundle);
router.delete("/bundle/:id",authMiddleware, bundleController.deleteBundle);
router.get("/bundlesNoauth", bundleController.getBundlesWithoutAuth);

router.post(
  "/quiz1",
  authMiddleware,
  roleMiddleware(2),
  quizController.createQuiz
);

router.get(
  "/quizzes/:bundleId",
  // authMiddleware,
  // roleMiddleware(2),
  quizController.getQuizzes
);
router.get("/quiz/:id",quizController.getQuizzesBybundleId)
router.get("/question/:id",questionController.countQuestions)
router.put("/client/quiz/:id",authMiddleware, quizController.updateQuiz);
router.delete("/admin/quiz/:id",authMiddleware, quizController.deleteQuiz);

router.post(
  "/question/:id",
  // authMiddleware,
  // roleMiddleware(2),
  questionController.createQuestion
);

router.get(
  "/question/:quizId",
  // authMiddleware,
  // roleMiddleware(2),
  questionController.getQuestions
);


router.put("/question/:id",authMiddleware, questionController.updateQuestion);
router.delete("/question/:id",authMiddleware, questionController.deleteQuestion);

export default router;