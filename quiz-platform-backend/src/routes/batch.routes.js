import express from "express";
import batchController from "../controllers/batch.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
const router = express.Router();

router.post("/",authMiddleware,roleMiddleware(2), batchController.createBatch);

router.get("/",authMiddleware,roleMiddleware(2),  batchController.getBatches);

router.get("/:id", authMiddleware,roleMiddleware(2), batchController.getBatchById);

router.put("/:id",authMiddleware,roleMiddleware(2),  batchController.updateBatch);

router.delete("/:id",authMiddleware,roleMiddleware(2),  batchController.deleteBatch);

export default router;