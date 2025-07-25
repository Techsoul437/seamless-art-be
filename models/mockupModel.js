import mongoose from "mongoose";

const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;

const mockupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    image: {
      key: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
        match: [urlRegex, "Image URL must be valid"],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Mockup", mockupSchema);