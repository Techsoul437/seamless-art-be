import Checkout from "../models/checkoutModel.js";
import Product from "../models/productModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import { checkoutValidationSchema } from "../validations/checkoutValidation.js";

export const saveCheckoutInfo = async (req, res) => {
  try {
    const guestData = req.body;
    await checkoutValidationSchema.validate(guestData);

    const { guestId, productId, email, ...rest } = guestData;

    if (!guestId) return sendError(res, "Missing guest ID", 400);
    if (!Array.isArray(productId) || productId.length === 0)
      return sendError(res, "At least one product ID is required", 400);

    const productsExist = await Product.find({ _id: { $in: productId } });
    if (productsExist.length !== productId.length) {
      return sendError(res, "Some product IDs are invalid", 400);
    }

    const existingGuest = await Checkout.findOne({ guestId, email });

    if (existingGuest) {
      const newProducts = productId.filter(
        (pid) => !existingGuest.products.map((p) => p.toString()).includes(pid)
      );

      if (newProducts.length) {
        existingGuest.products.push(...newProducts);
        await existingGuest.save();
      }

      return sendSuccess(res, "Guest checkout updated", {
        guest: {
          _id: existingGuest._id,
          guestId: existingGuest.guestId,
          email: existingGuest.email,
          products: existingGuest.products,
        },
      });
    }

    const newGuest = await Checkout.create({
      ...rest,
      ...guestData,
      products: productId,
    });

    return sendSuccess(res, "Guest checkout saved", {
      guest: {
        _id: newGuest._id,
        guestId: newGuest.guestId,
        email: newGuest.email,
        products: newGuest.products,
      },
    });
  } catch (error) {
    console.error("Guest Checkout Save Error:", error);
    return sendError(res, "Internal error while saving guest info", 500);
  }
};
