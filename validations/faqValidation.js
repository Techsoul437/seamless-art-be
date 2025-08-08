import * as yup from "yup";

export const faqValidationSchema = yup.object({
  question: yup
    .string()
    .required("Question is required")
    .min(5, "Question must be at least 5 characters")
    .max(200, "Question cannot exceed 200 characters"),

  answer: yup
    .string()
    .required("Answer is required")
    .min(5, "Answer must be at least 5 characters")
    .max(1000, "Answer cannot exceed 1000 characters"),

  department: yup
    .string()
    .required("Department is required")
    .min(2, "Department must be at least 2 characters")
    .max(100, "Department cannot exceed 100 characters"),
});

export const faqDepartmentValidationSchema = yup.object({
  name: yup
    .string()
    .required("Department name is required")
    .min(2, "Department name must be at least 2 characters")
    .max(50, "Department name cannot exceed 50 characters"),
});
