import models from "../../models/index.js";
import bundleService from "../services/bundleService.js";

const createBundle = async (req, res) => {

  try {

    const userId = req.user.id;

    const client = await models.Client.findOne({
      where: { user_id: userId }
    });

    if (!client) {

      return res.status(404).json({
        success: false,
        message: "Client profile not found"
      });

    }

    const bundle = await bundleService.createBundle(req.body, client.id);

    return res.status(201).json({
      success: true,
      data: bundle
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


const getBundles = async (req, res) => {

  try {

    const client = await models.Client.findOne({
      where: { user_id: req.user.id }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    const bundles = await bundleService.getBundles(req.query, client.id);

    return res.status(200).json({
      success: true,
      data: bundles
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

const getBundlesWithoutAuth = async (req, res) => {

  try {

    const bundles = await bundleService.getBundlesWithoutAuth(req.query);

    return res.status(200).json({
      success: true,
      data: bundles
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
const updateBundle = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const bundle = await bundleService.updateBundle(id, data);

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found"
      });
    }

    return res.json({
      success: true,
      message: "Bundle updated successfully",
      data: bundle
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const deleteBundle = async (req, res) => {
  try {
    const { id } = req.params;

    const bundle = await bundleService.deleteBundle(id);

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found"
      });
    }

    return res.json({
      success: true,
      message: "Bundle deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  createBundle,
  getBundles,
  updateBundle,
  deleteBundle,
  getBundlesWithoutAuth
};