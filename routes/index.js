import express from "express";
import imageRoutes from "./controllerRoutes/imageRoutes.js";
import categoryRoutes from "./controllerRoutes/categoryRoutes.js";
import productTypeRoutes from "./controllerRoutes/productTypeRoutes.js";
import productRoutes from "./controllerRoutes/productRoutes.js";
import authRoutes from "./controllerRoutes/authRoutes.js";
import wishlistRoutes from "./controllerRoutes/wishlistRoutes.js";
import cartRoutes from "./controllerRoutes/cartRoutes.js";
import paymentRoutes from "./controllerRoutes/paymentRoutes.js";
import userRoutes from "./controllerRoutes/userRoutes.js";
import adminUserRoutes from "./controllerRoutes/adminUserRoutes.js";
import checkoutRoutes from "./controllerRoutes/checkoutRoutes.js";
import orderRoutes from "./controllerRoutes/orderRoutes.js";
import mockupRoutes from "./controllerRoutes/mockupRoutes.js";
import adminOrderRoutes from "./controllerRoutes/adminOrderRoutes.js";
import faqRoutes from "./controllerRoutes/faqRoutes.js";
import inquiryRoutes from "./controllerRoutes/inquiryRoutes.js";

const router = express.Router();

router.use("/upload", imageRoutes);
router.use("/category", categoryRoutes);
router.use("/productType", productTypeRoutes);
router.use("/product", productRoutes);
router.use("/auth", authRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);
router.use("/payment", paymentRoutes);
router.use("/user", userRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/order", orderRoutes);
router.use("/mockup", mockupRoutes);
router.use("/purchase", adminOrderRoutes);
router.use("/faq", faqRoutes);
router.use("/inquiry", inquiryRoutes);

export default router;
