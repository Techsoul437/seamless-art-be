import express from "express";
import { getUserById, listUsers, updateUserById } from "../controllers/userController.js";

const router = express.Router();

router.get("/get", listUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUserById);

export default router;
