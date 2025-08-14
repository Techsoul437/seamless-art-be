import * as yup from "yup";

export const inquiryValidationSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  company: yup
    .string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters"),

  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),

  mobileNumber: yup
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .matches(/^[0-9]{10,15}$/, "Mobile number must be between 10 to 15 digits")
    .optional(),

  type: yup.string().optional(),

  message: yup
    .string()
    .required("Message is required")
    .min(5, "Message must be at least 5 characters")
    .max(1000, "Message cannot exceed 1000 characters"),
});
