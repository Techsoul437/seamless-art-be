import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  guestId: { type: String },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  ],
});

cartSchema.index({ guestId: 1 }, { sparse: true });
cartSchema.index({ user: 1 }, { sparse: true });

export default mongoose.model("Cart", cartSchema);
