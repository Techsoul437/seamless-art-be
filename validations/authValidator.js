import * as yup from "yup";

export const signupValidationSchema = yup.object({
  name: yup.string().trim().required("Name is required"),

  email: yup
    .string()
    .trim()
    .email("Invalid email address")
    .required("Email is required"),

  firebaseUid: yup.string().optional(),

  // password: yup
  //   .string()
  //   .required("Password is required")
  //   .min(8, "Password must be at least 8 characters")
  //   .matches(/[a-z]/, "Password must contain a lowercase letter")
  //   .matches(/[A-Z]/, "Password must contain an uppercase letter")
  //   .matches(/[0-9]/, "Password must contain a number")
  //   .matches(/[\W_]/, "Password must contain a special character"),

  password: yup.string().when("firebaseUid", {
    is: (uid) => !uid, // password required only when firebaseUid is NOT sent
    then: (schema) =>
      schema
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[a-z]/, "Password must contain a lowercase letter")
        .matches(/[A-Z]/, "Password must contain an uppercase letter")
        .matches(/[0-9]/, "Password must contain a number")
        .matches(/[\W_]/, "Password must contain a special character"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const sendOtpValidationSchema = yup.object({
  email: yup.string().trim().email().required("Email is required"),
});

export const verifyEmailValidationSchema = yup.object({
  email: yup.string().trim().email().required("Email is required"),
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

export const loginValidationSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Email must be valid")
    .required("Email is required"),

  password: yup.string().required("Password is required"),
});
