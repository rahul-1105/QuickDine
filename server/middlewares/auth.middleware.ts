import { NextFunction, Request, Response } from "express";
import { IUser, User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // veify token
      const decode = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };

      const user = await User.findById(decode.id).select("-password");

      if (!user) {
        return res.status(402).json({
          message: "Not authorized, user not found",
        });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Auth Middleware Error: ", error);
      return res.status(401).json({
        message: "Not authorized, token failed",
      });
    }
  }
  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied, admin role required",
    });
  }
};

export const ownerOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && (req.user.role === "owner" || req.user.role === "admin")) {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied, owner role required",
    });
  }
};
