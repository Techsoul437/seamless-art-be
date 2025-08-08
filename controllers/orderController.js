import Checkout from "../models/checkoutModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";

export const getOrder = async (req, res) => {
  try {
    const isGuest = !req.user;
    const guestId = req.query.guestId;
    const userId = req.user?._id;

    if (isGuest && !guestId) {
      return sendError(res, "guestId is required for guests", 400);
    }

    if (!isGuest && !userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const filter = isGuest ? { guestId } : { user: userId };

    const guestCheckout = await Checkout.findOne(filter).populate(
      "products.productId"
    );

    if (!guestCheckout) {
      return sendSuccess(res, "No purchased products found", {
        id: isGuest ? guestId : userId,
        products: [],
      });
    }

    return sendSuccess(res, "Purchased products fetched", {
      id: isGuest ? guestCheckout.guestId : guestCheckout.user,
      email: guestCheckout.email,
      products: guestCheckout.products,
    });
  } catch (error) {
    console.error("getPurchasedProducts error:", error);
    return sendError(res, "Internal error while fetching products", 500);
  }
};

export const migrateGuestOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userEmail = (req.user?.email || "").toLowerCase().trim();
    const { guestId } = req.body;

    if (!userId) return sendError(res, "User not authenticated", 401);
    if (!guestId) return sendError(res, "guestId is required", 400);

    const guestOrder = await Checkout.findOne({
      guestId,
      user: { $exists: false },
      email: userEmail,
    });

    if (!guestOrder) {
      return sendSuccess(res, "No guest orders found", []);
    }

    const userOrder = await Checkout.findOne({ user: userId });

    let migratedOrder;

    if (userOrder) {
      const combinedProducts = [...userOrder.products, ...guestOrder.products];

      migratedOrder = await Checkout.findOneAndUpdate(
        { _id: userOrder._id },
        { $set: { products: combinedProducts } },
        { new: true }
      );

      await guestOrder.deleteOne();
    } else {
      guestOrder.user = userId;
      guestOrder.guestId = undefined;
      await guestOrder.save({ validateBeforeSave: false });

      migratedOrder = guestOrder;
    }

    return sendSuccess(res, "Guest order migrated successfully", [
      migratedOrder,
    ]);
  } catch (error) {
    console.error("Order Migration Error:", error);
    return sendError(res, error.message || "Order migration failed", 500);
  }
};
