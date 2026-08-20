import { Router } from "express";
import {
  approveRestaurant,
  getAdminStats,
  getAllRestaurants,
} from "../controllers/admin.controller.js";
import { adminOnly, protect } from "../middlewares/auth.middleware.js";

const adminRoutes = Router();

adminRoutes.use(protect);
adminRoutes.use(adminOnly);

adminRoutes.get("/restaurants", getAllRestaurants);
adminRoutes.put("/restaurants/:id/approve", approveRestaurant);
adminRoutes.get("/stats", getAdminStats);

export default adminRoutes;
