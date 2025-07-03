import express from "express";
import { saveCheckoutInfo } from "../controllers/checkoutController.js";

const router = express.Router();

router.post("/guest", saveCheckoutInfo);

export default router;