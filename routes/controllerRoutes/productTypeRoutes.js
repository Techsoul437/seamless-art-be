import express from "express";
import { addProductType, deleteProductType, getProductType, getProductTypeById, updateProductType } from "../../controllers/productTypeController.js";

const router = express.Router();

router.post("/create", addProductType);
router.post("/get", getProductType);
router.get("/get/:id", getProductTypeById);
router.put("/update/:id", updateProductType);
router.delete("/delete/:id", deleteProductType);

export default router;
