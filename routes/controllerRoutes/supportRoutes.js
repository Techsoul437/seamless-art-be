import express from "express";
import { createSupport } from "../../controllers/supportController.js";

const route = express.Router();

route.post("/create", createSupport);
// route.post("/get", getAllInquiries);
// route.get("/get/:id", getInquiryById);
// route.delete("/delete/:id", deleteInquiry);
// route.patch("/update/:id", updateInquiry);

export default route;
