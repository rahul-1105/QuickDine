import { Router } from "express";
import { getFeaturedRestaurants, getRestaurantAvailability, getRestaurantBySlug, getRestaurants } from "../controllers/restaurant.controller.js";

const restaurantRoutes = Router();

restaurantRoutes.get("/", getRestaurants);
restaurantRoutes.get("/featured", getFeaturedRestaurants)
restaurantRoutes.get("/:slug", getRestaurantBySlug)
restaurantRoutes.get("/:id/availability", getRestaurantAvailability)

export default restaurantRoutes