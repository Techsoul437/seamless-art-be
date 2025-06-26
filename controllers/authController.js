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

import dotenv from "dotenv";
import { generateAndSendOtp } from "../utils/generateAndSendOtp.js";
import { sendResetEmail } from "../utils/sendResetEmail.js";
import { createResetToken } from "../utils/createResetToken.js";
import CryptoJS from "crypto-js";

dotenv.config();
const secretKey = process.env.JWT_SECRET;

export const signup = async (req, res) => {
  await signupValidationSchema.validate(req.body);

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, "Email already registered", 400);
    }

    const newUser = await new User({
      name,
      email,
      password,
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

    return sendSuccess(res, "Email verified Successfully", { token: token });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const signin = async (req, res) => {
  try {
    await loginValidationSchema.validate(req.body);
    const { email, password } = req.body;

     const hashedPassword = await bcrypt.hash(password, 12);

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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return sendError(res, "If email exists, a reset link has been sent.", 404);
  }

  const { rawToken, hashedToken } = createResetToken();

  user.resetToken = hashedToken;
  user.resetExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  res.cookie("reset_token", rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
    sameSite: "Strict",
  });

  await sendResetEmail(
    email,
    `${process.env.FRONTEND_URL}/reset-password/${rawToken}`
  );

  return sendSuccess(res, "Reset link sent successfully.");
};

export const resetPassword = async (req, res) => {
  const { password } = req.body;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Authorization token missing or invalid.", 401);
  }

  const rawToken = authHeader.split(" ")[1]; // Get the token after 'Bearer '

  const hashedToken = CryptoJS.SHA256(rawToken).toString(CryptoJS.enc.Hex);

  const user = await User.findOne({
    resetToken: hashedToken,
    resetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return sendError(res, "Invalid or expired link.", 400);
  }

  user.password = password;
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();

  return sendSuccess(res, "Password has been reset successfully.");
};

export const changePassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authorization token required", 401);
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return sendError(res, "Invalid or expired token", 401);
    }

    const userId = decoded?.userId;
    if (!userId) return sendError(res, "Invalid user ID in token", 401);

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return sendError(res, "Old and new passwords are required", 400);
    }

    const user = await User.findById(userId).select("+password");
    if (!user) return sendError(res, "User not found", 404);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return sendError(res, "Old password is incorrect", 400);

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return sendError(res, "New password must be different", 400);

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, "Password changed successfully");
  } catch (error) {
    console.error("Change Password Error:", error);
    return sendError(res, error.message || "Server error", 500);
  }
};
