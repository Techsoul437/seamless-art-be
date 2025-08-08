import express from "express";
import { addProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../../controllers/productController.js";

const router = express.Router();

router.post("/create", addProduct);
router.post("/get", getProducts);
router.get("/get/:id", getProductById);
router.put("/update/:id", updateProduct);
router.delete("/delete/:id", deleteProduct);

export default router;
