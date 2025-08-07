import mongoose from "mongoose";
import { urlRegex } from "../utils/regexHelper.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      url: {
        type: String,
        required: true,
        match: [urlRegex, "Image must be a valid URL"],
      },
      key: {
        type: String,
        required: true,
      },
    },
    discount: {
      type: Number,
      default: 0,
      validate: {
        validator: (v) => v >= 0,
        message: "Discount must be a non-negative number",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
