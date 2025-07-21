import Mockup from "../models/mockupModel.js";
import * as yup from "yup";
import { sendError, sendSuccess } from "../utils/responseHelper.js";

const mockupValidationSchema = yup.object({
  name: yup.string().trim().min(3).max(100).required("Title is required"),
  image: yup
    .object({
      key: yup.string().required("Image key is required"),
      url: yup
        .string()
        .url("Invalid image URL")
        .required("Image URL is required"),
    })
    .required("Image is required"),
});

export const addMockup = async (req, res) => {
  try {
    await mockupValidationSchema.validate(req.body);
    const { name, image } = req.body;

    const exists = await Mockup.findOne({ name });
    if (exists) return sendError(res, "Mockup already exists", 400);

    const mockup = await Mockup.create({ name, image });

    return sendSuccess(res, "Mockup created successfully", mockup);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllMockups = async (req, res) => {
  try {

    const mockups = await Mockup.find().sort({ createdAt: -1 });
    if (mockups.length === 0) {
      return sendSuccess(res, "No result found", mockups);
    }

    return sendSuccess(
      res,
      "Mockup files fetched successfully",
      mockups
    );
  } catch (error) {
    return res.status(500).json({ message: "Error fetching mockups" });
  }
};

export const getMockupById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not found", 404);

    const mockup = await Mockup.findById(id);
    if (!mockup) return sendError(res, "Mockup not found", 404);

    return sendSuccess(res, "Mockup File fetched successfully", mockup);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching mockup" });
  }
};

export const deleteMockup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not found", 404);

    const deleted = await Mockup.findByIdAndDelete(id);
    if (!deleted) return sendError(res, "Mockup not found", 404);

    return sendSuccess(res, "Mockup deleted successfully");
  } catch (error) {
    return res.status(400).json({ message: "Error deleting mockup" });
  }
};

export const updateMockup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not found", 404);

    const { name, image } = req.body;

    const mockup = await Mockup.findById(id);
    if (!mockup) return res.status(404).json({ message: "Mockup not found" });

    if (name) {
      const titleExists = await Mockup.findOne({ name, _id: { $ne: id } });
      if (titleExists) {
        return res
          .status(400)
          .json({ message: "Another mockup with this title already exists" });
      }
      mockup.name = name;
    }

    if (image) {
      mockup.image = image;
    }

    await mockup.save();

    return sendSuccess(res, "Mockup updated successfully", mockup);
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({ message: "Error updating mockups" });
  }
};
