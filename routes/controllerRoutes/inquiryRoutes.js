import express from "express";
import {
  createInquiry,
  deleteInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
} from "../../controllers/inquiryController.js";

const route = express.Router();

route.post("/create", createInquiry);
route.post("/get", getAllInquiries);
route.get("/get/:id", getInquiryById);
route.delete("/delete/:id", deleteInquiry);
route.patch("/update/:id", updateInquiry);

export default route;
