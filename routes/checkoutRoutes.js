import express from "express";
import { getPurchasedProducts, saveCheckoutInfo } from "../controllers/checkoutController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken.optional, saveCheckoutInfo);
router.post("/purchase", verifyToken.optional, getPurchasedProducts);

export default router;