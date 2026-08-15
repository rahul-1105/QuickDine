import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// helper function to generate jwt token
const generateToken = (id: string) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "30d",
    }
  );
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all the required fields",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });

      //hashing password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role,
      });

      if (newUser) {
        res.status(201).json({
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          token: generateToken(newUser._id.toString()),
        });
      } else {
        res.status(400).json({
          message: "Invalid user data",
        });
      }
    }
  } catch (error: any) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all the required fields",
      });
    }

    //check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    //check if password is corr{ect
    const isPasswordCorrect = await bcrypt.compare(password, user.password || "");

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id.toString()),
    });

  } catch (error : any) {
    res.status(500).json({
      message: "Server error",
    });
  }
};


export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if(!req.user) {
      return res.status(401).json({
        message: "Not Authorized"
      })
    }
    return res.json(req.user);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({
      message: error.message
    })
  }
}