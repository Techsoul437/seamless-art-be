import express from "express";
import {
  addFaq,
  deleteFaq,
  getAllFaqs,
  getFaqById,
  updateFaq,
} from "../../controllers/faq/faqController.js";
import { addFaqDepartment, deleteFaqDepartment, getAllFaqDepartments, getFaqDepartmentById, updateFaqDepartment } from "../../controllers/faq/faqDepartmentController.js";

const router = express.Router();

router.post("/create", addFaq);
router.post("/get", getAllFaqs);
router.get("/get/:id", getFaqById);
router.put("/update/:id", updateFaq);
router.delete("/delete/:id", deleteFaq);

router.post("/depart/create", addFaqDepartment);
router.post("/depart/get", getAllFaqDepartments);
router.get("/depart/get/:id", getFaqDepartmentById);
router.put("/depart/update/:id", updateFaqDepartment);
router.delete("/depart/delete/:id", deleteFaqDepartment);

export default router;
