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
    const userEmail = req.user?.email;
    const { guestId } = req.body;
    console.log("guestId", guestId);

    console.log("req.user", req.user);

    if (!userId) return sendError(res, "User not authenticated", 401);
    if (!guestId) return sendError(res, "guestId is required", 400);

    const guestOrder = await Checkout.findOne({
      guestId,
      user: { $exists: false },
    });
    console.log("guestOrder", guestOrder);

    if (!guestOrder) {
      return sendSuccess(res, "No guest orders found", []);
    }

    if (guestOrder.email !== userEmail) {
      return sendError(
        res,
        "Guest order email does not match logged-in user",
        403
      );
    }

    let migratedOrder;
    const userOrder = await Checkout.findOne({ user: userId });
    console.log("userOrder", userOrder);

    if (userOrder) {
      const existingProductIds = new Set(
        userOrder.products.map((p) => p.productId.toString())
      );
      console.log("existingProductIds", existingProductIds);

      const newProducts = guestOrder.products.filter(
        (p) => !existingProductIds.has(p.productId.toString())
      );
      console.log("newProducts", newProducts);

      const allProducts = [...userOrder.products, ...newProducts];
      console.log("allProducts", allProducts);

      const dedupedProducts = Array.from(
        new Map(allProducts.map((p) => [p.productId.toString(), p])).values()
      );
      console.log("dedupedProducts", dedupedProducts);

      userOrder.products = dedupedProducts;
      await userOrder.save();

      migratedOrder = userOrder;

      await guestOrder.deleteOne();
    } else {
      guestOrder.user = userId;
      guestOrder.guestId = undefined;
      await guestOrder.save();

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
