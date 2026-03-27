import express from "express";
import batchController from "../controllers/batch.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CREATE
router.post("/", authMiddleware, roleMiddleware(2), batchController.createBatch);

// GET ALL (with query params)
router.get("/", authMiddleware, roleMiddleware(2), batchController.getBatches);

// GET BY ID
router.get("/:id", authMiddleware, roleMiddleware(2), batchController.getBatchById);

// UPDATE
router.put("/:id", authMiddleware, roleMiddleware(2), batchController.updateBatch);

// DELETE
router.delete("/:id", authMiddleware, roleMiddleware(2), batchController.deleteBatch);
router.get("/bat/new", authMiddleware, roleMiddleware(4),batchController.getBatchByTeacherId)

export default router;