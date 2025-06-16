import { uploadToS3, updateS3Image, deleteFromS3 } from "../services/s3Service.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const uploadSingle = async (req, res) => {
  try {
    const file = req.file;
    const folder = req.body.folder;

    if (!file) return sendError(res, "File is required for upload", 400);
    if (!folder || typeof folder !== "string")
      return sendError(res, "Folder name must be provided as a string", 400);

    const result = await uploadToS3(file, folder);
    return sendSuccess(res, "Image uploaded successfully", result);
  } catch (error) {
    console.error("Upload Single Error:", error);
    return sendError(res, "Failed to upload image", 500, error);
  }
};

export const uploadMultiple = async (req, res) => {
  try {
    const files = req.files;
    const folder = req.body.folder;

    if (!files || !files.length) {
      return sendError(res, "Files are required for upload", 400);
    }

    if (!folder || typeof folder !== "string") {
      return sendError(res, "Folder name must be provided as a string", 400);
    }

    const uploads = await Promise.all(
      files.map((file) => uploadToS3(file, folder))
    );

    return sendSuccess(res, "Images uploaded successfully", uploads);
  } catch (error) {
    console.error("Upload Multiple Error:", error);
    return sendError(res, "Failed to upload images", 500, error);
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ success: false, message: "S3 key is required" });
    }

    const decodedKey = decodeURIComponent(key);
    const result = await deleteFromS3(decodedKey);

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Image deleted from S3 successfully",
      data: result,
    });
  } catch (error) {
    console.error("S3 Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete image from S3",
      error: error.message,
    });
  }
};

export const updateImage = async (req, res) => {
  try {
    const file = req.file;
    const { oldKey, folder } = req.body;

    if (!file || !oldKey || !folder)
      return sendError(
        res,
        "New file, old image key and folder are required",
        400
      );

    const result = await updateS3Image(oldKey, file, folder);

    return sendSuccess(res, "Image updated successfully", result);
  } catch (error) {
    console.error("Update Image Error:", error);
    return sendError(res, "Failed to update image", 500, error);
  }
};
