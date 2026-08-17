import { Router } from "express";
import { createOwnerRestaurant, getOwnerBookings, getOwnerRestaurant, updateBookingStatus, updateOwnerRestaurant } from "../controllers/owner.controller.js";
import upload from "../config/multer.js";
import { ownerOnly, protect } from "../middlewares/auth.middleware.js";

const ownerRoutes = Router();

ownerRoutes.use(protect);
ownerRoutes.use(ownerOnly)

ownerRoutes.get("/restaurant", getOwnerRestaurant) 
ownerRoutes.post("/restaurant", upload.single("image"), createOwnerRestaurant) 
ownerRoutes.put("/restaurant", upload.single("image"), updateOwnerRestaurant) 
ownerRoutes.get("/bookings", getOwnerBookings) 
ownerRoutes.put("/bookings/:id/status", updateBookingStatus) 


export default ownerRoutes;