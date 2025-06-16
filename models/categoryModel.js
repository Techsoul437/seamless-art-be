import mongoose from "mongoose";

const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;

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
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
