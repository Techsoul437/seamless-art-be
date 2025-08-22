import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    // store multiple order IDs if the user reports more than one
    orderIds: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one orderId is required",
      },
    },
    // the actual query/message from the user
    query: {
      type: String,
      required: true,
      trim: true,
    },
    // helpful for ops workflows
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // (kept to match your Inquiry structure, though timestamps already exist)
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Support", supportSchema);



import * as yup from "yup";

// normalize orderId/orderIds into a clean array of unique strings
const toOrderIdsArray = (value, originalValue) => {
  const raw =
    originalValue?.orderIds ??
    originalValue?.orderId ??
    originalValue;

  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return [raw];
  return [];
};

export const supportValidationSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),

  orderIds: yup
    .array()
    .transform(toOrderIdsArray)
    .of(yup.string().trim().min(3, "orderId seems too short"))
    .min(1, "At least one orderId is required")
    .test("dedupe", "orderIds cannot be empty", (arr) => {
      if (!arr) return false;
      const cleaned = [...new Set(arr.filter(Boolean))];
      return cleaned.length > 0;
    }),

  query: yup
    .string()
    .required("Query is required")
    .min(5, "Query must be at least 5 characters")
    .max(2000, "Query cannot exceed 2000 characters"),

  status: yup
    .string()
    .oneOf(["open", "in_progress", "resolved", "closed"])
    .optional(),

  isRead: yup.boolean().optional(),
});


import mongoose from "mongoose";
import Support from "../models/supportModel.js";
import { supportValidationSchema } from "../validations/supportValidation.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";

// helper to normalize orderId/orderIds into array + dedupe
const normalizePayload = (body) => {
  const rawOrder = body.orderIds ?? body.orderId ?? [];
  const arr = Array.isArray(rawOrder) ? rawOrder : [rawOrder];
  const orderIds = [...new Set(arr.filter(Boolean).map((s) => String(s).trim()))];

  return {
    email: body.email?.trim(),
    orderIds,
    query: body.query?.trim(),
    status: body.status,
    isRead: body.isRead,
  };
};

export const createSupport = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    await supportValidationSchema.validate(payload, { abortEarly: false });

    const doc = await Support.create(payload);
    return sendSuccess(res, "Support ticket created successfully", doc);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 400);
  }
};

export const getAllSupports = async (req, res) => {
  try {
    const { search, status, isRead } = req.body; // matching your Inquiry style

    const filter = {};

    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.$or = [
        { email: regex },
        { query: regex },
        // search inside the orderIds array
        { orderIds: { $elemMatch: regex } },
        // allow searching by exact status name too
        { status: regex },
      ];
    }

    if (status) filter.status = status;
    if (typeof isRead === "boolean") filter.isRead = isRead;

    const tickets = await Support.find(filter).sort({ createdAt: -1 });
    const message =
      tickets.length > 0
        ? "Support tickets fetched successfully"
        : "No support tickets found";

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

    const merged = {
      ...existing.toObject(),
      ...normalizePayload(req.body),
    };

    await supportValidationSchema.validate(merged, { abortEarly: false });

    const updated = await Support.findByIdAndUpdate(id, merged, {
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

// convenience: mark as read
export const markSupportAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not provided", 404);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid support ID format", 400);
    }

    const updated = await Support.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updated) return sendError(res, "Support ticket not found", 404);
    return sendSuccess(res, "Support ticket marked as read", updated);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};

// convenience: set status
export const updateSupportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) return sendError(res, "Id not provided", 404);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid support ID format", 400);
    }
    if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
      return sendError(res, "Invalid status value", 400);
    }

    const updated = await Support.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) return sendError(res, "Support ticket not found", 404);
    return sendSuccess(res, "Support ticket status updated", updated);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};
