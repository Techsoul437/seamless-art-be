import * as Yup from "yup";

export const adminOrderQuerySchema = Yup.object().shape({
  page: Yup.number().min(1).default(1),
  limit: Yup.number().min(1).max(100).default(20),
  status: Yup.string().oneOf(["succeeded", "failed", "pending", "refunded"]),
  paymentMethod: Yup.string(),
  productId: Yup.string().matches(/^[0-9a-fA-F]{24}$/),
  country: Yup.string(),
  search: Yup.string().trim(),
  startDate: Yup.date(),
  endDate: Yup.date(),
});