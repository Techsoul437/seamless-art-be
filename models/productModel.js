import mongoose from "mongoose";

const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;

const mockupFileSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: (v) => urlRegex.test(v),
      message: "Each URL must be valid",
    },
  },
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    originalPrice: {
      type: String,
      required: true,
      validate: {
        validator: (v) => !isNaN(Number(v)) && Number(v) >= 0,
        message: "Original price must be a non-negative number",
      },
    },
    price: {
      type: String,
      required: true,
      validate: {
        validator: (v) => !isNaN(Number(v)) && Number(v) >= 0,
        message: "Price must be a non-negative number",
      },
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
    mockupFiles: {
      type: [mockupFileSchema],
      default: [],
    },
    color: {
      type: [String],
      required: true,
      match: [
        /^#([0-9A-F]{3}){1,2}$/i,
        "Color must be a valid hex code (e.g., #FFF or #FFFFFF)",
      ],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    includedFiles: {
      type: [String],
      required: true,
      validate: [
        (arr) => arr.length > 0,
        "At least one included file is required",
      ],
    },
    fileSizes: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length > 0, "At least one file size is required"],
    },
    type: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length > 0, "At least one type is required"],
    },
    categories: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length > 0, "At least one category is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"],
    },
    premium: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
