import express from "express";
import {
  addCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/create", addCategory);
router.post("/get", getCategory);
router.get("/get/:id", getCategoryById);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

export default router;
