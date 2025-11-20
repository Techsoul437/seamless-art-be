import * as yup from "yup";

export const newsletterValidationSchema = yup.object({
    email: yup
        .string()
        .trim()
        .email("Invalid email address")
        .required("Email is required"),
});