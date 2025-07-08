import * as Yup from "yup";

export const checkoutValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .nullable()
    .notRequired()
    .test("is-valid-phone", "Invalid phone", (value) => {
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
  products: Yup.array()
    .of(
      Yup.object().shape({
        productId: Yup.string()
          .matches(/^[0-9a-fA-F]{24}$/, "Invalid product ID")
          .required("productId is required"),
      })
    )
    .min(1, "At least one product must be added")
    .required("Products are required"),
  guestId: Yup.string()
    .nullable()
    .when("$isGuest", {
      is: true,
      then: (schema) => schema.required("guestId is required for guests"),
      otherwise: (schema) => schema.strip(),
    }),
});
