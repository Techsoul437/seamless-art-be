import Support from "../models/supportModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import { sendSupportNotification } from "../utils/sendSupportEmail.js";
import { supportValidationSchema } from "../validations/supportValidation.js";
import dotenv from "dotenv";

dotenv.config();

export const createSupport = async (req, res) => {
  try {
    await supportValidationSchema.validate(req.body, { abortEarly: false });

    const support = await Support.create(req.body);

    await sendSupportNotification(
      req.body.email,
      support,
      process.env.FRONTEND_URL
    );

    return sendSuccess(res, "Support ticket created successfully", support);
  } catch (error) {
    console.error("Support Ticket Error:", error.message);
    return sendError(res, error.message, 400);
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { search } = req.body;

    let filter = {};

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
      ];
    }

    const tickets = await Support.find(filter).sort({ createdAt: -1 });
    const message =
      inquiries.length > 0
        ? "Tickets fetched successfully"
        : "No Tickets found";

    return sendSuccess(res, message, tickets);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};

export const getSupportById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not provided", 404);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid support ID format", 400);
    }

    const ticket = await Support.findById(id);
    if (!ticket) return sendError(res, "Support ticket not found", 404);

    return sendSuccess(res, "Support ticket fetched successfully", ticket);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};

export const updateSupport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not provided", 404);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid support ID format", 400);
    }

    const existing = await Support.findById(id);
    if (!existing) return sendError(res, "Support ticket not found", 404);

    await supportValidationSchema.validate(req.body);

    const updated = await Support.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, "Support ticket updated successfully", updated);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 400);
  }
};

export const deleteSupport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not provided", 404);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid support ID format", 400);
    }

    const deleted = await Support.findByIdAndDelete(id);
    if (!deleted) return sendError(res, "Support ticket not found", 404);

    return sendSuccess(res, "Support ticket deleted successfully");
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};
