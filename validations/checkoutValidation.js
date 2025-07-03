import * as Yup from "yup";

export const checkoutValidationSchema = Yup.object().shape({
  guestId: Yup.string().required("Guest ID is required"),
  name: Yup.string().trim().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .nullable()
    .notRequired()
    .test("is-valid-phone", "Invalid phone", function (value) {
      if (!value || value.trim() === "") return true;
      return /^\+?[0-9\s-]{7,15}$/.test(value);
    }),
  address: Yup.object().shape({
    street1: Yup.string().required("Address Line 1 is required"),
    street2: Yup.string().nullable(),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State/County is required"),
    zip: Yup.string().required("ZIP/Postcode is required"),
    country: Yup.string().required("Country is required"),
  }),
  productId: Yup.array()
    .of(Yup.string().matches(/^[0-9a-fA-F]{24}$/, "Invalid product ID"))
    .min(1, "At least one product must be selected")
    .required("Product IDs are required"),
});
