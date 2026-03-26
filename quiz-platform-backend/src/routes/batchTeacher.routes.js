import express from "express";
import controller from "../controllers/batchTeacher.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/assign",authMiddleware,roleMiddleware(2), controller.assignTeacher);
router.post("/assign-multiple",authMiddleware,roleMiddleware(2), controller.assignMultiple);
router.get("/batch/:batch_id",authMiddleware,roleMiddleware(2), controller.getBatchTeachers);
router.delete("/remove", authMiddleware,roleMiddleware(2),controller.removeTeacher);
router.get("/", authMiddleware,roleMiddleware(2),controller.getAllMappings);

export default router;