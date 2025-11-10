import express from "express";
import {
  addReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../../controllers/reviewController.js";

import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken.optional, addReview);
router.post("/get", getReviews);
router.get("/get/:id", getReviewById);
router.put("/update/:id", updateReview);
router.delete("/delete/:id", deleteReview);

export default router;
