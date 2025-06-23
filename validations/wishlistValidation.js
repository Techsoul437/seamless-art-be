import * as yup from "yup";
import mongoose from "mongoose";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const objectIdValidator = yup
    .string()
    .test("is-object-id", "Invalid ID", isObjectId);

export const createWishlistSchema = yup.object({
    name: yup
        .string()
        .required("Wishlist name is required")
        .min(2)
        .max(50)
        .matches(/^[a-zA-Z0-9\s]+$/, "Only alphanumeric characters allowed"),

    productId: yup
        .string()
        .required("Product ID is required")
        .test("is-object-id", "Invalid product ID", (value) =>
            mongoose.Types.ObjectId.isValid(value)
        ),

    guestId: yup
        .string()
        .nullable()
        .when([], {
            is: (_val, ctx) => ctx?.isGuest === true,
            then: (schema) => schema.required("guestId is required for guests"),
            otherwise: (schema) => schema.strip(), // remove if not guest
        }),
});

export const addToWishlistSchema = yup.object({
    wishlistId: yup.string().required("Wishlist ID is required"),
    productId: yup.string().required("Product ID is required"),
    guestId: yup.string().when("$isGuest", {
      is: true,
      then: (schema) => schema.required("guestId is required for guests"),
      otherwise: (schema) => schema.strip(),
    }),
  });
