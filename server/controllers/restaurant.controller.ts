import { Request, Response } from "express";
import { randomInt } from "node:crypto";
import { Restaurant } from "../models/resturant.model.js";
import { JsonWebTokenError } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Booking } from "../models/booking.model.js";

//get all restaurant with search and filters
export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const { search, priceRange, rating, location, sort } = req.query;

    // Build query object
    const queryObj: any = { status: "approved" };
    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (priceRange) {
      const prices = Array.isArray(priceRange) ? priceRange : [priceRange];
      queryObj.priceRange = { $in: prices };
    }

    if (rating) {
      queryObj.rating = { $gte: parseFloat(rating as string) };
    }

    if (location) {
      queryObj.location = { $regex: location as string, $options: "i" };
    }

    //sorting
    let sortOption: any = { createdAt: -1 };
    if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "price_low") {
      sortOption = { priceRange: 1 };
    } else if (sort === "price_high") {
      sortOption = { priceRange: -1 };
    }

    const restaurant = await Restaurant.find(queryObj).sort(sortOption);
    res.json(restaurant);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({
      message: error.message,
    });
  }
};

// get featured and exclusive Restaurant
export const getFeaturedRestaurants = async (req: Request, res: Response) => {
  try {
    const featured = await Restaurant.find({
      status: "approved",
      $or: [{ featured: true }, { exclusive: true }],
    }).limit(6);

    return res.json(featured);
  } catch (error: any) {
    console.log("Get featured restuarants error: ", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

//get single restaurant by slug
export const getRestaurantBySlug = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // if not approved, verify authorizatio (owner or admin)
    if (restaurant.status !== "approved") {
      let isAuthorized = false;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
          ) as { id: string };
          const user = await User.findById(decoded.id);

          if (
            user &&
            (user.role === "admin" ||
              (user.role === "owner" &&
                restaurant.owner.toString() === user._id.toString()))
          ) {
            isAuthorized = true;
          }
        } catch (error) {
          //ignore token verify error
        }

        if (!isAuthorized) {
          return res.status(404).json({
            message: "Restaurant not found or pending approval",
          });
        }
      }
    }
    return res.json(restaurant);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({
      message: error.message,
    });
  }
};

// get dynamic seat availability for slots
//GET /api/restaurants/:id/availability
export const getRestaurantAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({
        message: "Please provide a date",
      });
    }

    // if date is prsent search for restaurant
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(400).json({
        message: "Restaurant not found",
      });
    }

    //if restaurant is also available
    const bookingDate = new Date(date as string);

    // get all available bookings on this date for the restaurant
    const bookings = await Booking.find({
      restaurant: restaurant._id,
      date: bookingDate,
      status: "confirmed",
    });

    //Map slots to available capacites
    const availability = restaurant.availableSlots.map((slot) => {
      const bookedSeats = bookings
        .filter((b) => b.time === slot)
        .reduce((sum, b) => sum + b.guests, 0);

      const totalSeats = restaurant.totalSeats || 20;
      const availableSeats = Math.max(0, totalSeats - bookedSeats);

      return {
        time: slot,
        availableSeats,
        isAvailable: availableSeats > 0,
      };
    });

    return res.json(availability);
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({
      message: error.message,
    });
  }
};
