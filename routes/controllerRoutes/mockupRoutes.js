import express from "express";
import { addMockup, deleteMockup, getAllMockups, getMockupById, updateMockup } from "../../controllers/mockupController.js";

const router = express.Router();

router.post("/create", addMockup);
router.get("/get", getAllMockups);
router.get("/get/:id", getMockupById);
router.put("/:id", updateMockup);
router.delete("/delete/:id", deleteMockup);

export default router;