import Newsletter from "../models/newsletterModel.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { newsletterValidationSchema } from "../validations/newsletterValidation.js";

export const subscribe = async (req, res) => {
  try {
    await newsletterValidationSchema.validate(req.body);
    const { email } = req.body;

    if (!email) {
      return sendError(res, "Email is required");
    }

    const existingUser = await Newsletter.findOne({ email });
    if (existingUser) {
      return sendError(res, "Email already subscribed");
    }

    await Newsletter.create({ email });

    return sendSuccess(res, "Successfully subscribed to newsletter", {
      message: "Successfully subscribed to newsletter",
      email: email,
      status: "success",
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find();
    sendSuccess(res, "Successfully fetched all subscribers", subscribers);
  } catch (error) {
    sendError(res, error.message);
  }
};
