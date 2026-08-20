import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { Restaurant } from "../models/resturant.model.js";
import { User } from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";

// Get all restaurants for admin management
// GET /api/admin/restaurants
export const getAllRestaurants = async (req: AuthRequest, res: Response) => {
  try {
    const restaurants = await Restaurant.find({})
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

// Approve/reject a restaurant profile
// PUT /api/admin/restaurants/:id/approve
export const approveRestaurant = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid booking status" });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant profile not found",
      });
    }

    restaurant.status = status;
    await restaurant.save();

    return res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

// Get system statistics
// GET /api/admin/stats
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalBookings = await Booking.countDocuments({});
    const totalRestaurants = await Restaurant.countDocuments({});

    // get latest 10 bookings
    const latestBookings = await Booking.find({})
      .populate("user", "name email")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({
      users: {
        totalUsers,
        totalOwners,
        total: totalUsers + totalOwners,
      },
      restaurants: {
        total: totalRestaurants,
      },
      bookings: {
        total: totalBookings,
      },
      latestBookings,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};
