import express from "express";
import {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
const router = express.Router();

router.post("/", authMiddleware,roleMiddleware(2), createCourse);

router.get("/", authMiddleware,roleMiddleware(2), getCourses);

router.put("/:id", authMiddleware,roleMiddleware(2), updateCourse);

router.delete("/:id", authMiddleware,roleMiddleware(2), deleteCourse);

export default router;