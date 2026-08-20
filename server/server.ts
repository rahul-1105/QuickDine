import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import restaurantRoutes from "./routes/restaurant.route.js";
import bookingRoutes from "./routes/booking.route.js";
import ownerRoutes from "./routes/owner.route.js";
import adminRoutes from "./routes/admin.route.js";

const app = express();

connectDB(); // Call the connectDB function to establish a connection to the database

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/owner", ownerRoutes)
app.use("/api/admin", adminRoutes)

//Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => { 
  console.error("Unhandle Error:", err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
