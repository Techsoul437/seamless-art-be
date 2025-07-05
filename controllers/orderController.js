import Checkout from "../models/checkoutModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";

export const getOrder = async (req, res) => {
  try {
    const isGuest = !req.user;
    const guestId = req.query.guestId;
    const userId = req.user?.userId;

    if (isGuest && !guestId) {
      return sendError(res, "guestId is required for guests", 400);
    }

    if (!isGuest && !userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const filter = isGuest ? { guestId } : { user: userId };

    const guestCheckout = await Checkout.findOne(filter).populate("products.productId");

    if (!guestCheckout) {
      return sendError(res, "Checkout not found", 404);
    }

    return sendSuccess(res, "Purchased products fetched", {
      id: isGuest ? guestCheckout.guestId : guestCheckout.user,
      products: guestCheckout.products,
    });
  } catch (error) {
    console.error("getPurchasedProducts error:", error);
    return sendError(res, "Internal error while fetching products", 500);
  }
};

export const migrateGuestOrders = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { guestId } = req.body;

    if (!userId) return sendError(res, "User not authenticated", 401);
    if (!guestId) return sendError(res, "guestId is required", 400);

    // 1. Fetch all existing user orders
    const userOrders = await Checkout.find({ user: userId });
    const userProductIds = new Set(
      userOrders.flatMap((order) =>
        order.products.map((p) => p?.toString?.() || p._id?.toString?.())
      )
    );

    // 2. Get guest orders that are not already linked to a user
    const guestOrders = await Checkout.find({
      guestId,
      user: { $exists: false },
    });
    console.log('guestOrders', guestOrders);

    if (!guestOrders.length) {
      return sendSuccess(res, "No guest orders found", []);
    }

    const migratedOrders = [];

    for (const order of guestOrders) {
        console.log('order', order);
      // 3. Filter out already ordered products
      const newProducts = order.products.filter(
        (p) => !userProductIds.has(p?.toString?.() || p._id?.toString?.())
      );
      console.log('newProducts', newProducts);

      if (newProducts.length === 0) {
        // Optional: delete order if it's all duplicates
        await order.deleteOne();
        continue;
      }

      // 4. Update order
      order.user = userId;
      order.guestId = undefined;
      order.products = newProducts;
      await order.save();

      // 5. Add new products to the set so future checks remain accurate
      newProducts.forEach((p) =>
        userProductIds.add(p?.toString?.() || p._id?.toString?.())
      );

      migratedOrders.push(order);
    }

    return sendSuccess(
      res,
      "Guest orders migrated successfully",
      migratedOrders
    );
  } catch (error) {
    console.error("Order Migration Error:", error);
    return sendError(res, error.message || "Order migration failed", 500);
  }
};
