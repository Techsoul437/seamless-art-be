import Wishlist from "../models/wishlistModel.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import {
  createWishlistSchema,
  addToWishlistSchema,
} from "../validations/wishlistValidation.js";

export const createWishlist = async (req, res) => {
  try {
    const isGuest = !req.user;

    await createWishlistSchema.validate(req.body, {
      context: { isGuest },
    });

    const { name, productId, guestId } = req.body;

    let filter;
    let wishlistData = {
      name,
      products: [productId],
    };

    if (isGuest) {
      if (!guestId) return sendError(res, "guestId is required", 400);

      filter = { guestId, name };
      wishlistData.guestId = guestId;
      wishlistData.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    } else {
      filter = { user: req.user.userId, name };
      wishlistData.user = req.user.userId;
    }

    const exists = await Wishlist.findOne(filter);
    if (exists) return sendError(res, "Wishlist name already exists", 400);

    const wishlist = await Wishlist.create(wishlistData);

    return sendSuccess(res, "Wishlist Created Successfully", wishlist);
  } catch (error) {
    console.error(error);
    return sendError(res, error.message, 400);
  }
};

export const getWishlists = async (req, res) => {
  try {
    const isGuest = !req.user;
    const guestId = req.query.guestId;

    let filter;

    if (isGuest) {
      if (!guestId) return sendError(res, "guestId is required", 400);
      filter = { guestId };
    } else {
      filter = { user: req.user.userId };
    }

    const wishlists = await Wishlist.find(filter).populate("products");

    return sendSuccess(res, "Wishlists fetched", wishlists);
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch", 500);
  }
};

export const getWishlistById = async (req, res) => {
  try {
    const isGuest = !req.user;
    const guestId = req.query.guestId;
    const { id } = req.params;

    if (!id) return sendError(res, "Wishlist ID not provided", 400);

    const wishlist = await Wishlist.findById(id).populate("products");
    if (!wishlist) return sendError(res, "Wishlist not found", 404);

    if (isGuest) {
      if (!guestId || wishlist.guestId !== guestId) {
        return sendError(res, "Unauthorized guest access", 403);
      }
    } else {
      if (!req.user?.userId || String(wishlist.user) !== String(req.user.userId)) {
        return sendError(res, "Unauthorized user access", 403);
      }
    }

    return sendSuccess(res, "Wishlist fetched successfully", wishlist);
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch wishlist", 500);
  }
};

export const addProductToWishlist = async (req, res) => {
  try {
    const isGuest = !req.user;

    await addToWishlistSchema.validate(req.body, {
      context: { isGuest },
    });

    const { wishlistId, productId, guestId } = req.body;

    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) return sendError(res, "Wishlist not found", 404);

    // Ensure guestId or user is authorized to update
    if (isGuest) {
      if (!guestId || wishlist.guestId !== guestId) {
        return sendError(res, "Unauthorized guest access", 403);
      }
    } else {
      if (String(wishlist.user) !== String(req.user.userId)) {
        return sendError(res, "Unauthorized user access", 403);
      }
    }

    if (wishlist.products.includes(productId)) {
      return sendError(res, "Product already exists in wishlist", 400);
    }

    wishlist.products.push(productId);
    await wishlist.save();

    return sendSuccess(res, "Product Added Successfully!", wishlist);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const deleteWishlist = async (req, res) => {
  try {
    const isGuest = !req.user;
    const { wishlistId } = req.params;
    const guestId = req.query.guestId;

    if (!wishlistId) return sendError(res, "wishlistId is required", 400);

    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) return sendError(res, "Wishlist not found", 404);

    if (isGuest) {
      if (!guestId || wishlist.guestId !== guestId) {
        return sendError(res, "Unauthorized guest access", 403);
      }
    } else {
      if (String(wishlist.user) !== String(req.user.userId)) {
        return sendError(res, "Unauthorized user access", 403);
      }
    }

    await wishlist.deleteOne();

    return sendSuccess(res, "Wishlist deleted successfully");
  } catch (error) {
    console.error(error);
    return sendError(res, error.message || "Failed to delete wishlist", 500);
  }
};

export const removeProductFromWishlist = async (req, res) => {
  try {
    const isGuest = !req.user;
    const { wishlistId, productId } = req.body;
    const guestId = req.query.guestId;

    if (!wishlistId || !productId) {
      return sendError(res, "wishlistId and productId are required", 400);
    }

    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) {
      return sendError(res, "Wishlist not found", 404);
    }

    if (isGuest) {
      if (!guestId || wishlist.guestId !== guestId) {
        return sendError(res, "Unauthorized guest access", 403);
      }
    } else {
      if (String(wishlist.user) !== String(req.user.userId)) {
        return sendError(res, "Unauthorized user access", 403);
      }
    }

    const productIndex = wishlist.products.findIndex(
      (id) => String(id) === String(productId)
    );

    if (productIndex === -1) {
      return sendError(res, "Product not found in wishlist", 400);
    }

    wishlist.products.splice(productIndex, 1);
    if (wishlist.products.length === 0) {
      await wishlist.deleteOne(); // Delete the whole wishlist
      return sendSuccess(res, "Product removed from wishlist", null);
    } else {
      await wishlist.save(); // Only save if wishlist still exists
      return sendSuccess(res, "Product removed from wishlist", wishlist);
    }
  } catch (error) {
    console.error(error);
    return sendError(res, error.message || "Failed to remove product", 500);
  }
};

export const migrateGuestWishlist = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { guestId } = req.body;

    if (!userId) return sendError(res, "User not authenticated", 401);
    if (!guestId) return sendError(res, "guestId is required", 400);

    // Get all guest wishlists
    const guestWishlists = await Wishlist.find({ guestId });

    if (!guestWishlists.length) {
      return sendSuccess(res, "No guest wishlists found", []);
    }

    const migratedWishlists = [];

    for (const guestWishlist of guestWishlists) {
      const { name, products } = guestWishlist;

      // Check if user already has a wishlist with the same name
      const existingUserWishlist = await Wishlist.findOne({ user: userId, name });

      if (existingUserWishlist) {
        // Merge products (avoid duplicates)
        const uniqueProducts = [
          ...new Set([
            ...existingUserWishlist.products.map((id) => id.toString()),
            ...products.map((id) => id.toString()),
          ]),
        ];
        existingUserWishlist.products = uniqueProducts;
        await existingUserWishlist.save();
        await guestWishlist.deleteOne(); // Clean up guest wishlist
        migratedWishlists.push(existingUserWishlist);
      } else {
        // Transfer guest wishlist to user
        guestWishlist.user = userId;
        guestWishlist.guestId = undefined;
        guestWishlist.expiresAt = undefined;
        await guestWishlist.save();
        migratedWishlists.push(guestWishlist);
      }
    }

    return sendSuccess(res, "Wishlists migrated successfully", migratedWishlists);
  } catch (error) {
    console.error("Migration error:", error);
    return sendError(res, error.message || "Migration failed", 500);
  }
};
