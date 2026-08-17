import { Router } from "express";
import { cancelBookings, creatBooking, getMyBookings } from "../controllers/booking.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const bookingRoutes = Router();

bookingRoutes.post("/", protect, creatBooking)
bookingRoutes.get("/my", protect, getMyBookings)
bookingRoutes.put("/:id/cancel", protect, cancelBookings)

export default bookingRoutes;
