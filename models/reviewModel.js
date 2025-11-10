import mongoose from "mongoose";
import { urlRegex } from "../utils/regexHelper.js";

const reviewSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      match: [urlRegex, "Image URL must be valid"],
    },
    userImage: {
      type: String,
      required: true,
      match: [urlRegex, "User image URL must be valid"],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    stars: {
      type: Number,
      required: true,
      min: [1, "Minimum 1 star required"],
      max: [5, "Maximum 5 stars allowed"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
