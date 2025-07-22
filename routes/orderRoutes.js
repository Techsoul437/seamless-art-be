import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getOrder, migrateGuestOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/get", verifyToken.optional, getOrder);
router.post("/migrate-order", verifyToken.required, migrateGuestOrders);

export default router;