import User from "../models/userModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import { isValidObjectId } from "mongoose";

const sanitizeUser = (user) => {
  const { password, otp, resetToken, resetExpires, __v, ...rest } =
    user.toObject();
  return rest;
};

// GET /users/profile (private)
export const getProfile = async (req, res) => {
  try {
    if (!req.user?._id)
      return sendError(res, "Access denied. Please login first.", 401);

    const user = await User.findById(req.user._id);
    if (!user)
      return sendError(res, "Profile not found. Please try again later.", 404);

    return sendSuccess(res, "Your profile details have been retrieved.", {
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Get User Profile Error:", error);
    return sendError(res, "Failed to fetch profile", 500);
  }
};

// PUT /users/profile (private)
export const updateProfile = async (req, res) => {
  try {
    if (!req.user?.userId) return sendError(res, "Unauthorized access", 401);

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, "User not found", 404);

    const { username, name, mobile, purpose, image, address } = req.body;

    if (username && username !== user.username) {
      const existing = await User.findOne({
        username,
        _id: { $ne: user._id },
      });
      if (existing)
        return sendError(
          res,
          "This username is already taken. Try something else.",
          400
        );
      user.username = username;
    }

    user.name = name ?? user.name;
    user.mobile = mobile ?? user.mobile;
    user.purpose = purpose ?? user.purpose;
    if (image && typeof image === "object" && image.url && image.key) {
      user.image = {
        url: image.url,
        key: image.key,
      };
    }

    if (address && typeof address === "object") {
      user.address = {
        ...user.address,
        street1: address.street1 || user.address?.street1,
        street2: address.street2 || user.address?.street2,
        city: address.city || user.address?.city,
        state: address.state || user.address?.state,
        zip: address.zip || user.address?.zip,
        country: address.country || user.address?.country,
      };
    }
    await user.save();

    return sendSuccess(res, "Your profile has been successfully updated.", {
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return sendError(res, error.message || "Could not update profile.", 400);
  }
};

// GET /admin/users (admin only)
export const listUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return sendSuccess(res, "No users found in the system.", { users: [] });
    }

    const safeUsers = users.map(sanitizeUser);

    return sendSuccess(res, "All users have been fetched successfully.", {
      users: safeUsers,
    });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return sendError(res, "Failed to retrieve users. Please try again.", 500);
  }
};

// GET /admin/users/:id (admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return sendError(res, "Invalid or missing user ID.", 400);
    }

    const user = await User.findById(id);
    if (!user) return sendError(res, "User not found.", 404);

    return sendSuccess(res, "User details retrieved.", {
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    return sendError(res, "Something went wrong while retrieving user.", 500);
  }
};

// PUT /admin/users/:id (admin only)
export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return sendError(res, "Invalid user ID provided.", 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, "User not found with the provided ID.", 404);
    }

    const { role, purpose, image, status } = req.body;

    if (role && ["user", "admin"].includes(role)) {
      user.role = role;
    }

    if (purpose) user.purpose = purpose;
    if (image && typeof image === "object" && image.url && image.key) {
      user.image = {
        url: image.url,
        key: image.key,
      };
    }

    if (status && ["active", "suspended"].includes(status)) {
      user.status = status;
    }

    await user.save();

    return sendSuccess(res, "User privileges updated successfully", {
      user: {
        _id: user._id,
        role: user.role,
        purpose: user.purpose,
        image: user.image,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Admin update error:", error);
    return sendError(
      res,
      "Unable to update user. Please try again later.",
      500
    );
  }
};