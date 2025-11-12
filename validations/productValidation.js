import * as yup from "yup";
import { urlRegex } from "../utils/regexHelper.js";

export const productValidationSchema = yup.object({
  title: yup
    .string()
    .trim()
    .strict()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .required("Title is required"),

  subTitle: yup
    .string()
    .trim()
    .strict()
    .min(3, "Sub-title must be at least 3 characters")
    .max(150, "Sub-title cannot exceed 150 characters")
    .required("Sub-title is required"),

  description: yup
    .string()
    .trim()
    .strict()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),

  originalPrice: yup
    .string()
    .required("Original price is required")
    .test(
      "is-valid-number",
      "Original price must be a non-negative number",
      (value) =>
        value !== undefined && !isNaN(Number(value)) && Number(value) >= 0
    ),

  price: yup
    .string()
    .required("Price is required")
    .test(
      "is-valid-number",
      "Price must be a non-negative number",
      (value) =>
        value !== undefined && !isNaN(Number(value)) && Number(value) >= 0
    ),

  previewImage: yup
    .object({
      url: yup
        .string()
        .trim()
        .matches(urlRegex, "Preview Image must be a valid URL")
        .required("Preview Image URL is required"),
      key: yup.string().trim().required("Preview Image key is required"),
    })
    .required("Preview image is required"),

  originalImage: yup
    .object({
      url: yup
        .string()
        .trim()
        .matches(urlRegex, "Original Image must be a valid URL")
        .required("Original Image URL is required"),
      key: yup.string().trim().required("Original Image key is required"),
    })
    .required("Original image is required"),

  mockupFiles: yup
    .array()
    .of(
      yup.object().shape({
        key: yup.string().required("Each mockup must have a key"),
        url: yup
          .string()
          .trim()
          .url("Each mockup file must be a valid URL")
          .required("Each mockup file must have a URL"),
      })
    )
    .max(9, "You can upload a maximum of 9 mockup files")
    .notRequired(),
  status: yup
    .string()
    .oneOf(
      ["active", "inactive"],
      "Status must be either 'active' or 'inactive'"
    )
    .default("active")
    .notRequired(),

  includedFiles: yup
    .array()
    .of(yup.string().trim().min(1, "Included file entries cannot be empty"))
    .min(1, "At least one included file is required")
    .required("Included files are required"),

  fileSizes: yup
    .array()
    .of(yup.string().trim())
    .min(1, "At least one file size is required")
    .required("File sizes are required"),

  type: yup
    .array()
    .of(yup.string().trim().min(1, "Type entries cannot be empty"))
    .min(1, "At least one type is required")
    .required("Types are required"),

  categories: yup
    .array()
    .of(yup.string().trim().min(1, "Category entries cannot be empty"))
    .min(1, "At least one category is required")
    .required("Categories are required"),

  tags: yup
    .array()
    .of(yup.string().trim().min(1, "Tags cannot contain empty strings"))
    .notRequired(),

  slug: yup
    .string()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Slug must be lowercase and hyphen-separated (e.g., 'my-product-name')",
    })
    .required("Slug is required"),

  premium: yup
    .boolean()
    .typeError("Premium must be a boolean")
    .required("Premium status is required"),

  newArrivals: yup
    .boolean()
    .typeError("new Arrivals must be a boolean")
    .required("new Arrivals status is required"),
});
