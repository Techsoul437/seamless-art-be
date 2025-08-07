import express from "express";
import {
  getAllOrders,
  getRevenueSummary,
} from "../controllers/adminOrderController.js";

const router = express.Router();

router.get("/orders", getAllOrders);
router.get("/revenue", getRevenueSummary);

export default router;
