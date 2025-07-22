import express from "express";
import { addProductToWishlist, createWishlist, deleteWishlist, getWishlistById, getWishlists, migrateGuestWishlist, removeProductFromWishlist } from "../controllers/wishlistController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken.optional, createWishlist);
router.get("/get", verifyToken.optional, getWishlists);
router.get("/get/:id", verifyToken.optional, getWishlistById);
router.post("/add-product", verifyToken.optional, addProductToWishlist);
router.delete("/:wishlistId", verifyToken.optional, deleteWishlist);
router.put("/remove-product", verifyToken.optional, removeProductFromWishlist);
router.post("/migrate-guest", verifyToken.required, migrateGuestWishlist);

export default router;