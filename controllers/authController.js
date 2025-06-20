import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import {
  loginValidationSchema,
  sendOtpValidationSchema,
  signupValidationSchema,
  verifyEmailValidationSchema,
} from "../validations/authValidator.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";

import dotenv from "dotenv";
import { generateAndSendOtp } from "../utils/generateAndSendOtp.js";
dotenv.config();
const secretKey = process.env.JWT_SECRET;
console.log("secretKey", secretKey);

export const signup = async (req, res) => {
  await signupValidationSchema.validate(req.body);

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, "Email already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    }).save();

    await generateAndSendOtp(newUser);

    return sendSuccess(
      res,
      "User registered successfully. Please Verify the e-mail",
      {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          isVerified: newUser.isVerified,
        },
      }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return sendError(res, error.message, 500);
  }
};

export const sendOtp = async (req, res) => {
  try {
    await sendOtpValidationSchema.validate(req.body);
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "User not found with this email", 404);

    if (user.isVerified) return sendError(res, "Email already verified", 400);

    await generateAndSendOtp(user); 

    return sendSuccess(res, "OTP sent to email");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    await verifyEmailValidationSchema.validate(req.body);
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "User not found with this email", 404);
    if (!user.otp || user.otp !== otp)
      return sendError(res, "Invalid otp", 404);
    if (user.otpExpires < Date.now()) return sendError(res, "expired OTP", 404);

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ userId: user._id, email }, secretKey, {
      expiresIn: "7d",
    });

    return sendSuccess(res, "Email verified Successfully", {token: token});
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const signin = async (req, res) => {
  try {
    await loginValidationSchema.validate(req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return sendError(res, "You are not Registered yet!", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password", 401);
    }

    if (!user.isVerified) {
      await generateAndSendOtp(user);
      return sendError(
        res,
        "Email not verified. OTP resent to your email.",
        403
      );
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, {
      expiresIn: "7d",
    });

    return sendSuccess(res, "User Logged in successfully", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("error", error);
    return sendError(res, error.message, 500);
  }
};
