import express from "express";
import upload from "../../middlewares/multer.js";
import {
  uploadSingle,
  uploadMultiple,
  deleteImage,
  updateImage,
  downloadImage,
  generateInvoice,
} from "../../controllers/imageController.js";

const router = express.Router();

router.post("/upload-single", upload.single("file"), uploadSingle);
router.post("/upload-multiple", upload.array("files"), uploadMultiple);
router.delete("/delete-image/:key", deleteImage);
router.put("/update", upload.single("file"), updateImage);
router.get("/download", downloadImage);
router.post("/generate-invoice", generateInvoice);

export default router;