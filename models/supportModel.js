import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Support", inquirySchema);
