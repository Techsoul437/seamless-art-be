import mongoose from "mongoose";
import Checkout from "../models/checkoutModel.js";
import Product from "../models/productModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import { checkoutValidationSchema } from "../validations/checkoutValidation.js";
import { sendPatternDownloadEmail } from "../utils/sendPatternEmail.js";
import { generateSignedDownloadUrl } from "../services/s3Service.js";
import { generateInvoicePdf } from "../utils/generateInvoicePdf.js";

const snapshotProducts = (clientProducts, dbProducts) => {
  return clientProducts.map((item) => {
    const dbProduct = dbProducts.find(
      (p) => p._id.toString() === item.productId
    );

    if (!dbProduct) {
      throw new Error(`Product not found for ID: ${item.productId}`);
    }

    return {
      ...item,
      productId: dbProduct._id,
      amount: dbProduct.price,
      title: dbProduct.title,
      originalImage: {
        url: dbProduct.originalImage?.url,
        key: dbProduct.originalImage?.key,
      },
    };
  });
};

export const saveCheckoutInfo = async (req, res) => {
  try {
    const isGuest = !req.user;
    const { name, email, phone, address, products, guestId } = req.body;
    const userId = req.user?._id;

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

    const filter = isGuest ? { guestId, email } : { user: userId };
    let checkoutRecord = await Checkout.findOne(filter);

    const snapshottedProducts = snapshotProducts(products, productsExist);

    if (checkoutRecord) {
      checkoutRecord.products.push(...snapshottedProducts);
      await checkoutRecord.save();
    } else {
      const newCheckoutData = {
        name,
        email,
        phone,
        address,
        products: snapshottedProducts,
        ...(isGuest ? { guestId } : { user: userId }),
      };

      checkoutRecord = await Checkout.create(newCheckoutData);
    }

    const productDownloadDetails = await Promise.all(
      productsExist.map(async (p) => {
        const matchingCheckoutProducts = checkoutRecord.products
          .filter((cp) => cp.productId.toString() === p._id.toString())
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const checkoutProduct = matchingCheckoutProducts[0];

        const downloadUrl = await generateSignedDownloadUrl(
          p.originalImage?.key
        );

        const invoiceUrl = await generateInvoicePdf({
          orderId: checkoutProduct._id.toString(),
          email,
          products: [p], 
          total: `${p.originalPrice}`,
          discount: `${p.originalPrice - p.price}`, 
          finalTotal: `${p.price}`,
          logoUrl:
            "https://seamless-art-storage.s3.eu-north-1.amazonaws.com/logo/SeamlessArt+(1).png",
        });

        return {
          name: p.title,
          imageUrl: p.originalImage?.url,
          downloadUrl,
          invoiceUrl,
        };
      })
    );

    await sendPatternDownloadEmail(email, productDownloadDetails);

    return sendSuccess(
      res,
      `Your order has been confirmed. The pattern file(s) have been delivered to your email - ${email}.`,
      { checkout: checkoutRecord }
    );
  } catch (error) {
    console.error("Guest Checkout Save Error:", error);
    return sendError(res, "Internal error while saving ckeckout info", 500);
  }
};

export const getPurchasedProducts = async (req, res) => {
  try {
    const isGuest = !req.user;
    const { guestId, productId } = req.body;
    const userId = req.user?._id;

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

    const checkout = await Checkout.findOne(filter).populate(
      "products.productId"
    );

    if (!checkout) {
      return sendError(res, "Checkout not found", 404);
    }

    const latestProductsMap = new Map();

    for (const product of checkout.products) {
      const pid = product.productId?._id?.toString();
      if (!productId.includes(pid)) continue;

      const existing = latestProductsMap.get(pid);

      if (
        !existing ||
        new Date(product.createdAt) > new Date(existing.createdAt)
      ) {
        latestProductsMap.set(pid, product);
      }
    }

    const latestProducts = Array.from(latestProductsMap.values());
    return sendSuccess(res, "Purchased products fetched", {
      id: isGuest ? checkout.guestId : checkout.user,
      products: latestProducts.map((item) => item.productId),
    });
  } catch (error) {
    console.error("getPurchasedProducts error:", error);
    return sendError(res, "Internal error while fetching products", 500);
  }
};
