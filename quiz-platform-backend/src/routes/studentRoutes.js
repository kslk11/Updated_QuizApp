import express from "express";
import studentController from "../controllers/studentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public
router.post("/register", studentController.registerStudent);

// Protected (role 3 = student)
router.post("/start-quiz/:id",        authMiddleware, roleMiddleware(3), studentController.startQuiz);
router.post("/submit-quiz/:id",       authMiddleware, roleMiddleware(3), studentController.submitQuiz);
router.get("/bundle/:id/quizzes",     authMiddleware, roleMiddleware(3), studentController.getQuestions);
router.get("/result/:id",             authMiddleware, roleMiddleware(3), studentController.getResult);
router.put("/admin/student/:id",authMiddleware, studentController.updateStudent);
router.delete("/admin/student/:id",authMiddleware, studentController.deleteStudent);
router.get("/attempt-history", authMiddleware, studentController.getAttemptHistory);
router.get("/quiz/:quizId/leaderboard", studentController.leaderboard);
router.get("/dashboard/top-students", studentController.getTopStudents);
export default router;