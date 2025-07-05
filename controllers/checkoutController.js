import mongoose from "mongoose";
import Checkout from "../models/checkoutModel.js";
import Product from "../models/productModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import { checkoutValidationSchema } from "../validations/checkoutValidation.js";

export const saveCheckoutInfo = async (req, res) => {
  try {
    const isGuest = !req.user;
    const { name, email, phone, address, products, guestId } = req.body;
    const userId = req.user?.userId;

    if (!Array.isArray(products) || products.length === 0) {
      return sendError(res, "At least one product is required", 400);
    }
    if (isGuest && !guestId) {
      return sendError(res, "guestId is required for guests", 400);
    }
    if (!isGuest && !userId) {
      return sendError(res, "User not authenticated", 401);
    }

    await checkoutValidationSchema.validate(req.body);

    const productIds = products.map((p) => p.productId);
    const productsExist = await Product.find({ _id: { $in: productIds } });
    if (productsExist.length !== productIds.length) {
      return sendError(res, "Some product IDs are invalid", 400);
    }

    const filter = isGuest ? { guestId, guestId } : { user: userId };
    let checkoutRecord = await Checkout.findOne(filter);

    if (checkoutRecord) {
      const existingProductIds = new Set(
        checkoutRecord.products.map((p) => p.productId.toString())
      );

      const newProducts = products
        .filter((p) => !existingProductIds.has(p.productId.toString()))
        .map((p) => ({
          productId: new mongoose.Types.ObjectId(p.productId),
          addedAt: new Date(),
        }));

      if (newProducts.length > 0) {
        checkoutRecord.products.push(...newProducts);
        await checkoutRecord.save();
      }

      return sendSuccess(res, "Checkout updated", {
        checkout: checkoutRecord,
      });
    }

    const newCheckoutData = {
      name,
      email,
      phone,
      address,
      products,
    };

    if (isGuest) {
      newCheckoutData.guestId = guestId;
    } else {
      newCheckoutData.user = userId;
    }

    const newCheckout = await Checkout.create(newCheckoutData);

    return sendSuccess(res, "Checkout saved", { checkout: newCheckout });
  } catch (error) {
    console.error("Guest Checkout Save Error:", error);
    return sendError(res, "Internal error while saving ckeckout info", 500);
  }
};

export const getPurchasedProducts = async (req, res) => {
  try {
    const isGuest = !req.user;
    const { guestId, productId } = req.body;
    const userId = req.user?.userId;

    if (isGuest && !guestId) {
      return sendError(res, "guestId is required for guests", 400);
    }

    if (!isGuest && !userId) {
      return sendError(res, "User not authenticated", 401);
    }

    if (!Array.isArray(productId) || productId.length === 0) {
      return sendError(res, "productId must be a non-empty array", 400);
    }

    const filter = isGuest ? { guestId } : { user: userId };

    const checkout = await Checkout.findOne(filter).populate("products");

    if (!checkout) {
      return sendError(res, "Checkout not found", 404);
    }

    const filteredProducts = checkout.products.filter((product) =>
      productId.includes(product._id.toString())
    );

    return sendSuccess(res, "Purchased products fetched", {
      id: isGuest ? checkout.guestId : checkout.user,
      products: filteredProducts,
    });
  } catch (error) {
    console.error("getPurchasedProducts error:", error);
    return sendError(res, "Internal error while fetching products", 500);
  }
};