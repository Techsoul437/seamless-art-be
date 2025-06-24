import express from "express";
import { addProductToWishlist, createWishlist, deleteWishlist, getWishlists, removeProductFromWishlist } from "../controllers/wishlistController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken.optional, createWishlist);
router.get("/get", verifyToken.optional, getWishlists);
router.post("/add-product", verifyToken.optional, addProductToWishlist);
router.delete("/:wishlistId", verifyToken.optional, deleteWishlist);
router.put("/remove-product", verifyToken.optional, removeProductFromWishlist);

export default router;