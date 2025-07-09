import * as yup from "yup";

export const categoryValidationSchema = yup.object({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters"),
   image: yup
     .object({
       url: yup
         .string()
         .trim()
         .url("Image must be a valid URL")
         .required("Image URL is required"),
       key: yup.string().trim().required("Image key is required"),
     })
     .required("Product image is required"),
  discount: yup.number()
    .min(0, "Discount must be a non-negative number")
    .optional(),
});