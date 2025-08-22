import Inquiry from "../models/inquiryModel.js";
import { inquiryValidationSchema } from "../validations/inquiryValidation.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import mongoose from "mongoose";

export const createInquiry = async (req, res) => {
  try {
    await inquiryValidationSchema.validate(req.body);

    const inquiry = await Inquiry.create(req.body);

    return sendSuccess(res, "Inquiry send successfully", inquiry);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 400);
  }
};

export const getAllInquiries = async (req, res) => {
  try {
    const { search } = req.body;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 });
    const message =
      inquiries.length > 0
        ? "Inquiries fetched successfully"
        : "No inquiries found";

    return sendSuccess(res, message, inquiries);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};

export const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not provided", 404);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid inquiry ID format", 400);
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return sendError(res, "Inquiry not found", 404);

    return sendSuccess(res, "Inquiry fetched successfully", inquiry);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};

export const updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not provided", 404);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid inquiry ID format", 400);
    }

    const existingInquiry = await Inquiry.findById(id);
    if (!existingInquiry) return sendError(res, "Inquiry not found", 404);

    await inquiryValidationSchema.validate(req.body);

    const updatedInquiry = await Inquiry.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, "Inquiry updated successfully", updatedInquiry);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 400);
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not provided", 404);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid inquiry ID format", 400);
    }

    const deletedInquiry = await Inquiry.findByIdAndDelete(id);
    if (!deletedInquiry) return sendError(res, "Inquiry not found", 404);

    return sendSuccess(res, "Inquiry deleted successfully");
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};
