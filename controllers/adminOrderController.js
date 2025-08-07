import Checkout from "../models/checkoutModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import { adminOrderQuerySchema } from "../validations/adminOrderValidation.js";
import mongoose from "mongoose";

export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      productId,
      search,
      startDate,
      endDate,
    } = req.query;

    await adminOrderQuerySchema.validate(req.query);

    const filters = {};

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filters.$or = [
        { email: { $regex: search, $options: "i" } },
        { guestId: { $regex: search, $options: "i" } },
        { "products.paymentId": { $regex: search, $options: "i" } },
      ];
    }

    if (productId) {
      filters["products.productId"] = new mongoose.Types.ObjectId(productId);
    }

    if (status) {
      filters["products.paymentStatus"] = status;
    }

    const orders = await Checkout.find(filters)
      .populate("user")
      .populate("products.productId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    orders.forEach((order) => {
      order.products.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    });

    const total = await Checkout.countDocuments(filters);

    return sendSuccess(res, "Orders fetched successfully", {
      total,
      page,
      limit,
      orders,
    });
  } catch (error) {
    console.error("Admin getAllOrders error:", error);
    return sendError(res, "Failed to fetch orders", 500);
  }
};

export const getRevenueSummary = async (req, res) => {
  try {
    const range = req.query.range || "this_week";

    const now = new Date();
    let startDate = new Date(0); // default: all time

    switch (range) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "this_week":
        const firstDayOfWeek = now.getDate() - now.getDay();
        startDate = new Date(now.setDate(firstDayOfWeek));
        break;
      case "last_week":
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
        startDate = new Date(now.setDate(diff));
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "last_year":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      case "alltime":
        startDate = new Date(0);
        break;
    }

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate },
          "products.paymentStatus": "succeeded",
        },
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$products.amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ];

    const stats = await Checkout.aggregate(pipeline);

    const summary = stats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
    };

    return sendSuccess(res, "Revenue summary fetched", {
      range,
      ...summary,
    });
  } catch (error) {
    console.error("Revenue summary error:", error);
    return sendError(res, "Error fetching revenue summary", 500);
  }
};
