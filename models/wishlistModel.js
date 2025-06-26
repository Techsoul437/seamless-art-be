import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

wishlistSchema.index(
  { user: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $type: "objectId" } },
  }
);

wishlistSchema.index(
  { guestId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { guestId: { $type: "string" } },
  }
);

wishlistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete guest wishlists after 7 days

wishlistSchema.pre("validate", function (next) {
  if (!this.user && !this.guestId) {
    return next(new Error("Either user or guestId must be provided."));
  }
  next();
});

export default mongoose.model("Wishlist", wishlistSchema);
