// import Stripe from "stripe";
// import dotenv from "dotenv";

// dotenv.config();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2024-04-10",
// });

// export const createPaymentIntent = async (req, res) => {
//   try {
//     const { amount } = req.body;

//     if (!amount) {
//       return res.status(400).json({ error: "Amount is required" });
//     }

//     const stripeAmount = Math.round(amount * 100);

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: stripeAmount,
//       currency: "usd",
//       automatic_payment_methods: {
//         enabled: true,
//       },
//     });

//     return res.status(200).json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error("Stripe Error:", error);
//     return res
//       .status(500)
//       .json({ error: `Internal Server Error: ${error.message}` });
//   }
// };

import crypto from "crypto";
import dotenv from "dotenv";
import { razorpay } from "../config/razorpay.js";
import Checkout from "../models/checkoutModel.js";
import Product from "../models/productModel.js";
import axios from "axios";

dotenv.config();

// ------------------------------
//  CREATE ORDER (Razorpay)
// ------------------------------
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency: "USD",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
    });
  }
};

// ------------------------------
//  VERIFY PAYMENT (SIGNATURE)
// ------------------------------
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      checkoutId,
      productId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !checkoutId ||
      !productId
    ) {
      return res.status(400).json({ error: "Missing payment fields" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // ------------------------------
    // UPDATE CHECKOUT PRODUCT STATUS
    // ------------------------------
    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) return res.status(404).json({ error: "Checkout not found" });

    const productIndex = checkout.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in checkout" });
    }

    checkout.products[productIndex].paymentId = razorpay_payment_id;
    checkout.products[productIndex].clientSecret = razorpay_order_id; // store order id
    checkout.products[productIndex].paymentStatus = "succeeded";

    await checkout.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified & saved",
    });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return res.status(500).json({
      error: `Internal Server Error: ${error.message}`,
    });
  }
};
