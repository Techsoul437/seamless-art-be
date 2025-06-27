import * as yup from "yup";

export const addToCartSchema = yup.object().shape({
  productId: yup.string().required(),
  guestId: yup.string().when('$isGuest', {
    is: true,
    then: yup.string().required('Guest ID required for guests'),
  }),
});