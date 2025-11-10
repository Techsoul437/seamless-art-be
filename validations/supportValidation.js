import * as yup from "yup";
import {objectIdRegex} from '../utils/regexHelper.js';

export const supportValidationSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),

  orderId: yup
    .string()
    .matches(objectIdRegex, "Invalid Order ID")
    .required("Order ID is required"),

  message: yup
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .max(1000, "Message cannot exceed 1000 characters")
    .required("Message is required"),
});
