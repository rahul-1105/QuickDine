import { Request, Response } from "express";
import { Restaurant } from "../models/resturant.model.js";
import { Booking } from "../models/booking.model.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// create a new booking
// POST /api/bookings
// @access Private
export const creatBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId, date, time, guests, occasion, specialRequests } =
      req.body;

    if (!restaurantId || !date || !time || !guests) {
      return res.status(400).json({
        message: "Please provide all required reservation details",
      });
    }

    // check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(400).json({
        message: "Restaurant not found",
      });
    }

    // verify restaurant is approved
    if (restaurant.status !== "approved") {
      return res.status(400).json({
        message: "Reservation are not open for this restaurant yet",
      });
    }

    // verify seat availability
    const requestedGuests = Number(guests);
    const existingBookings = await Booking.find({
      restaurant: restaurantId,
      date: new Date(date),
      time,
      status: "confirmed",
    });

    const bookedSeats = existingBookings.reduce((sum, b) => sum + b.guests, 0);
    const totalSeats = restaurant.totalSeats || 20;
    const availableSeats = totalSeats - bookedSeats;

    if (requestedGuests > availableSeats) {
      return res.status(400).json({
        message: `Unable to reserve. Only ${availableSeats} seats are available for this time slot.`,
      });
    }

    const booking = await Booking.create({
      user: req.user?._id,
      restaurant: restaurantId,
      date: new Date(date),
      time,
      guests: Number(guests),
      occasion,
      specialRequests,
      status: "confirmed",
    });

    const populatedBooking = await booking.populate(
      "restaurant",
      "name location image address"
    );

    return res.status(201).json({
      message: "Booking created successfully",
      populatedBooking,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

// Get logged in user bookings
// GET /api/bookings/my
// @access Private
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ user: req.user?._id })
      .populate("restaurant", "name location image, address, slug")
      .sort({ date: -1, time: -1 });

    return res.json(bookings);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

// Cancel a booking
// PUT /api/bookings/:id/cancel
// @access Private
export const cancelBookings = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user?._id.toString()) {
      return res.status(401).json({
        message: "Not authorized to cancel this booking",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    const populatedBooking = await booking.populate(
      "restaurant",
      "location image address"
    );

    return res.json(populatedBooking);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};
