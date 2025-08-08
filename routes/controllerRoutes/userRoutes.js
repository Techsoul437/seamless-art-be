import express from "express";
import { getProfile, updateProfile } from "../../controllers/userController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/get", verifyToken.required, getProfile);
router.put("/profile", verifyToken.required, updateProfile);

export default router;
