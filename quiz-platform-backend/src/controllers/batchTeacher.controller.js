import models from "../../models/index.js";
import batchTeacherService from "../services/batchTeacher.service.js";

const assignTeacher = async (req, res) => {
  try {
      const clientId = await models.Client.findOne({where:{
          user_id:req.user.id
        }})
        
        const data = {...req.body,client_id:clientId.id};
        console.log("data",data)

    const result = await batchTeacherService.assignTeacherToBatch(data);

    return res.status(201).json({
      success: true,
      message: "Teacher assigned to batch",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const assignMultiple = async (req, res) => {
  try {
    const { batch_id, teacher_ids } = req.body;
    const clientId = await models.Client.findOne({where:{
          user_id:req.user.id
        }})
    const result = await batchTeacherService.assignMultipleTeachers(
      batch_id,
      teacher_ids,
      clientId.id
    );

    return res.status(201).json({
      success: true,
      message: "Multiple teachers assigned",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBatchTeachers = async (req, res) => {
  try {
    const { batch_id } = req.params;

    const data = await batchTeacherService.getTeachersByBatch(batch_id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeTeacher = async (req, res) => {
  try {
    const { batch_id, teacher_id } = req.body;

    await batchTeacherService.removeTeacherFromBatch(batch_id, teacher_id);

    return res.status(200).json({
      success: true,
      message: "Teacher removed from batch",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  assignTeacher,
  assignMultiple,
  getBatchTeachers,
  removeTeacher,
};