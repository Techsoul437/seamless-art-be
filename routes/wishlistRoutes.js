import express from "express";
import { addProductToWishlist, createWishlist, getWishlists } from "../controllers/wishlistController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken.optional, createWishlist);
router.get("/get", verifyToken.optional, getWishlists);
router.post("/add-product", verifyToken.optional, addProductToWishlist);

export default router;