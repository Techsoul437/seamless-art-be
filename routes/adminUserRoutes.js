import express from "express";
import { deleteUser, getUserById, listUsers, updateUserById } from "../controllers/userController.js";

const router = express.Router();

router.get("/get", listUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUserById);
router.delete("/:id", deleteUser);

export default router;
