import Checkout from "../models/checkoutModel.js";
import Product from "../models/productModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import { checkoutValidationSchema } from "../validations/checkoutValidation.js";

export const saveCheckoutInfo = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const isGuest = !req.user;
    const { productId, email, ...rest } = req.body;
    const userId = req.user?.userId;
    const guestId = req.body.guestId;

    if (!Array.isArray(productId) || productId.length === 0) {
      return sendError(res, "At least one product ID is required", 400);
    }
    if (isGuest && !guestId) {
      return sendError(res, "guestId is required for guests", 400);
    }
    if (!isGuest && !userId) {
      return sendError(res, "User not authenticated", 401);
    }

    await checkoutValidationSchema.validate(req.body);

    const productsExist = await Product.find({ _id: { $in: productId } });
    if (productsExist.length !== productId.length) {
      return sendError(res, "Some product IDs are invalid", 400);
    }

    const filter = isGuest ? { guestId, email } : { user: userId };

    let checkoutRecord = await Checkout.findOne(filter);

    if (checkoutRecord) {
      const existingProductId = checkoutRecord.products.map((p) =>
        p.toString()
      );
      const newProducts = productId.filter(
        (pid) => !existingProductId.includes(pid)
      );

      if (newProducts.length > 0) {
        checkoutRecord.products.push(...newProducts);
        await checkoutRecord.save();
      }

      return sendSuccess(res, "Checkout updated", {
        checkout: {
          _id: checkoutRecord._id,
          user: checkoutRecord.user,
          guestId: checkoutRecord.guestId,
          email: checkoutRecord.email,
          products: checkoutRecord.products,
        },
      });
    }

    const newCheckout = await Checkout.create({
      ...rest,
      products: productId,
      ...(isGuest ? { guestId, email } : { user: userId }),
    });

    return sendSuccess(res, "Checkout saved", {
      checkout: {
        _id: newCheckout._id,
        user: newCheckout.user,
        guestId: newCheckout.guestId,
        email: newCheckout.email,
        products: newCheckout.products,
      },
    });
  } catch (error) {
    console.error("Guest Checkout Save Error:", error);
    return sendError(res, "Internal error while saving ckeckout info", 500);
  }
};

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

    const guestCheckout = await Checkout.findOne(filter).populate("products");

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
