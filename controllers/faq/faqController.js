import { sendError, sendSuccess } from "../../utils/responseHelper.js";
import { faqValidationSchema } from "../../validations/faqValidation.js";
import { Faq, FaqDepartment } from "../../models/faqModel.js";
import mongoose from "mongoose";

export const addFaq = async (req, res) => {
  try {
    await faqValidationSchema.validate(req.body);

    const faq = await Faq.create(req.body);
    return sendSuccess(res, "FAQ created successfully", faq);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};

export const getAllFaqs = async (req, res) => {
  try {
    const { department, search } = req.body;
    let filter = {};
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ];
    }

    if (department) {
      const dept = await FaqDepartment.findOne({ name: department });
      if (dept) {
        filter.department = dept._id;
      } else {
        return sendSuccess(res, "No FAQs found for this department", []);
      }
    }

    const faqs = await Faq.find(filter)
      .populate("department")
      .sort({ createdAt: -1 });
    const message =
      faqs.length > 0 ? "FAQs fetched successfully" : "No FAQs found";
    return sendSuccess(res, message, faqs);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};

export const getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not found", 404);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid FAQ ID format", 400);
    }

    const faq = await Faq.findById(id).populate("department");
    if (!faq) return sendError(res, "FAQ not found", 404);

    return sendSuccess(res, "FAQ fetched successfully", faq);
  } catch (error) {
    console.error(error.message);
    return sendError(res, "Invalid FAQ ID", 400);
  }
};

export const updateFaq = async (req, res) => {
  try {
    await faqValidationSchema.validate(req.body);

    const { id } = req.params;
    if (!id) return sendError(res, "Id not found", 404);

    const faq = await Faq.findById(id);
    if (!faq) return sendError(res, "FAQ not found", 404);

    const updatedFaq = await Faq.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, "FAQ updated successfully", updatedFaq);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 400);
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not found", 404);

    const deletedFaq = await Faq.findByIdAndDelete(id);
    if (!deletedFaq) return sendError(res, "FAQ not found", 404);

    return sendSuccess(res, "FAQ deleted successfully");
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 400);
  }
};
