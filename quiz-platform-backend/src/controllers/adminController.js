import models from "../../models/index.js";
import adminService from "../services/adminService.js";

const createClient = async (req, res) => {

  try {

    const client = await adminService.createClient(req.body);

    return res.status(201).json({
      success: true,
      data: client
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


const getAllClient = async (req, res) => {
  try {
    const clients = await models.Client.findAll({
      include: [{
        model: models.User,
        attributes: ['id', 'name', 'email']
      }]
    });

    const formattedData = clients.map(client => ({
      clientId: client.id,
      companyName: client.company_name,
      contactNumber: client.contact_number,
      name: client.users?.name, 
      email: client.users?.email,
      userId: client.users?.id
    }));
    console.log(formattedData)
    return res.status(200).json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getClientById = async (req, res) => {

  try {

    const client = await models.Client.findByPk(req.params.id);

    if (!client) {

      return res.status(404).json({
        success: false,
        message: "Client not found"
      });

    }

    return res.status(200).json({
      success: true,
      data: client
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

const dashboard = async (req, res) => {

  try {

    const data = await adminService.getDashboard();

    res.json({
      success: true,
      data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
const updateClient = async (req, res) => {
  try {

    const clientId = req.params.id;
    const data = req.body;

    const client = await adminService.updateClient(clientId, data);

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: client
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};

const deleteClient = async (req, res) => {
  try {

    const clientId = req.params.id;

    const result = await adminService.deleteClient(clientId);

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};
export default {
  createClient,
  getAllClient,
  getClientById,
  dashboard,
  updateClient,deleteClient
};