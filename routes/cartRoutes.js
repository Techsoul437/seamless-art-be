import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  migrateGuestCart,
  emptyCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken.optional, addToCart);
router.get("/get/:id", verifyToken.optional, getCart);
router.put("/remove", verifyToken.optional, removeFromCart);
router.post("/migrate", verifyToken.optional, migrateGuestCart);
router.post("/empty", verifyToken.optional, emptyCart);

export default router;