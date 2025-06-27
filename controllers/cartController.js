import mongoose from "mongoose";
import Cart from "../models/cartModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";

export const migrateGuestCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { guestId } = req.body;

    if (!userId) return sendError(res, "User not authenticated", 401);
    if (!guestId) return sendError(res, "guestId is required", 400);

    const guestCart = await Cart.findOne({ guestId });
    if (!guestCart) return sendSuccess(res, "No guest cart found", []);

    const userCart = await Cart.findOne({ user: userId });

    if (userCart) {
      // Merge items
      const existingProductIds = new Set(
        userCart.items.map((id) => id.toString())
      );

      guestCart.items.forEach((productId) => {
        if (!existingProductIds.has(productId.toString())) {
          userCart.items.push(productId);
        }
      });

      await userCart.save();
    } else {
      guestCart.user = userId;
      guestCart.guestId = undefined;
      await guestCart.save();
    }

    // Delete guest cart
    await Cart.deleteOne({ guestId });

    return sendSuccess(res, "Guest cart migrated successfully");
  } catch (error) {
    console.error("Cart Migration Error:", error);
    return sendError(res, error.message, 500);
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, guestId } = req.body;
    const userId = req.user?.userId;

    if (!guestId) return sendError(res, "Guest ID is required", 400);
    if (!productId)
      return sendError(res, "Product ID is missing or invalid.", 400);

    let cart = userId
      ? await Cart.findOne({ user: userId })
      : await Cart.findOne({ guestId });

    if (!cart) {
      cart = new Cart(userId ? { user: userId } : { guestId });
    }

    const alreadyExists = cart.items.some(
      (item) => item.toString() === productId
    );

    if (!alreadyExists) {
      cart.items.push(productId);
    } else {
      return sendError(res, "This product is already in your cart.", 409);
    }

    await cart.save();
    return sendSuccess(res, "Product added to your cart successfully.", cart);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const guestId = req.params?.id;

    let filter;

    if (userId) {
      filter = { user: userId };
    } else if (guestId) {
      filter = { guestId };
    } else {
      return sendError(
        res,
        "Authentication failed. guestId or user required",
        401
      );
    }

    const cart = await Cart.findOne(filter)
      .populate({ path: "items", options: { strictPopulate: false } })
      .lean();

    return sendSuccess(res, "Cart fetched", cart || { items: [] });
  } catch (error) {
    console.error("getCart error:", error);
    return sendError(res, error.message || "Failed to fetch cart", 500);
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const isGuest = !req.user;
    const { productId } = req.body;
    const guestId = req.query.guestId;
    const userId = req.user?.userId;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return sendError(res, "Valid productId is required", 400);
    }

    const filter = isGuest ? { guestId } : { user: userId };
    const cart = await Cart.findOne(filter);
    if (!cart) {
      return sendError(res, "Cart not found", 404);
    }

    if (isGuest) {
      if (cart.guestId !== guestId) {
        return sendError(res, "Unauthorized guest access", 403);
      }
    } else {
      if (String(cart.user) !== String(userId)) {
        return sendError(res, "Unauthorized user access", 403);
      }
    }

    const productIndex = cart.items.findIndex(
      (id) => id.toString() === productId
    );

    if (productIndex === -1) {
      return sendError(res, "Product not found in cart", 400);
    }

    cart.items.splice(productIndex, 1);

    if (cart.items.length === 0) {
      await cart.deleteOne();
      return sendSuccess(res, "Product removed and cart deleted", null);
    } else {
      await cart.save();
      return sendSuccess(res, "Product removed from cart", cart);
    }
  } catch (error) {
    console.error("removeFromCart error:", error);
    return sendError(res, error.message || "Failed to remove product", 500);
  }
};
