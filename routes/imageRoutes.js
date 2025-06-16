import express from "express";
import upload from "../middlewares/multer.js";
import {
  uploadSingle,
  uploadMultiple,
  deleteImage,
  updateImage,
} from "../controllers/imageController.js";

const router = express.Router();

router.post("/upload-single", upload.single("file"), uploadSingle);
router.post("/upload-multiple", upload.array("files"), uploadMultiple);
router.delete("/delete-image/:key", deleteImage);
router.put("/update", upload.single("image"), updateImage);

export default router;
