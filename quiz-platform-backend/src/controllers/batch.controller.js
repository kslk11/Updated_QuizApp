import models from "../../models/index.js";
import clientRepo from "../repositories/clientRepo.js";
import batchService from "../services/batch.service.js";
const createBatch = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const client = await clientRepo.findClientByUserId(req.user.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    // ✅ Validate course
    const course = await models.Course.findByPk(req.body.course_id);

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course does not exist"
      });
    }

    const data = {
      ...req.body,
      client_id: client.id,
      course_id: course.id   // ✅ ensure valid
    };

    const batch = await batchService.createBatch(data);

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getBatches = async (req, res) => {
  try {

    const { page = 1, limit = 10, search = null } = req.query;

    const batches = await batchService.getBatches(page, limit, search);

    return res.status(200).json({
      success: true,
      message: "Batches fetched successfully",
      ...batches
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET BY ID
const getBatchById = async (req, res) => {
  try {

    const batch = await batchService.getBatchById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Batch fetched successfully",
      data: batch
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ UPDATE
const updateBatch = async (req, res) => {
  try {

    const batch = await batchService.updateBatch(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: batch
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ DELETE
const deleteBatch = async (req, res) => {
  try {

    await batchService.deleteBatch(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Batch deleted successfully"
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch
};