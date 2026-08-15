import { Router } from "express";
import { getMe, loginUser, registerUser } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const authRoutes = Router();

authRoutes.post('/register', registerUser)
authRoutes.post('/login', loginUser)
authRoutes.get('/me', protect, getMe)

export default authRoutes;