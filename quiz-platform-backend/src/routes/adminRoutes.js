import express from "express";
import adminController from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/create-client",
  authMiddleware,
  roleMiddleware(1),
  adminController.createClient
);
router.get(
  '/allclients',
  authMiddleware,
  roleMiddleware(1),
  adminController.getAllClient)
  router.get("/dashboard", adminController.dashboard);
  router.get(
    '/:id',
    authMiddleware,
    roleMiddleware(2),
    adminController.getClientById)

  router.put("/admin/client/:id", adminController.updateClient);
router.delete("/admin/client/:id", adminController.deleteClient);

export default router;