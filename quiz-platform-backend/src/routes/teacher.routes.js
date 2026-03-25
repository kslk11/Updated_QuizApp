import express from "express";
import teacherController from "../controllers/teacher.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ✅ CREATE
router.post("/", authMiddleware,roleMiddleware(2), teacherController.createTeacher);

// ✅ GET ALL
router.get("/",authMiddleware,roleMiddleware(2), teacherController.getTeachers);

// ✅ GET BY ID
router.get("/:id",authMiddleware,roleMiddleware(2), teacherController.getTeacherById);

// ✅ UPDATE
router.put("/:id",authMiddleware,roleMiddleware(2), teacherController.updateTeacher);

// ✅ DELETE
router.delete("/:id",authMiddleware,roleMiddleware(2), teacherController.deleteTeacher);

export default router;