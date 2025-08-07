import mongoose from "mongoose";
import { urlRegex } from "../utils/regexHelper.js";

const productItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    amount: { type: Number, required: true },
    title: {
      type: String,
      required: true,
    },
    originalImage: {
      url: {
        type: String,
        required: true,
        match: [urlRegex, "Original Image must be a valid URL"],
      },
      key: {
        type: String,
        required: true,
      },
    },
    paymentId: { type: String, required: true },
    clientSecret: { type: String, required: true },
    currency: { type: String, default: "usd" },
    paymentStatus: {
      type: String,
      enum: ["succeeded", "pending", "failed", "refunded"],
      default: "succeeded",
    },
  },
  { timestamps: true }
);

const checkoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      street1: {
        type: String,
        required: true,
        trim: true,
      },
      street2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zip: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
    },
    products: [productItemSchema],
    guestId: {
      type: String,
      required: function () {
        // Required only if user is not logged in
        return !this.user;
      },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Checkout", checkoutSchema);
