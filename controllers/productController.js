import Product from "../models/productModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import { productValidationSchema } from "../validations/productValidation.js";

export const addProduct = async (req, res) => {
  try {
    await productValidationSchema.validate(req.body);

    const { slug } = req.body;

    const exists = await Product.findOne({ slug });
    if (exists)
      return sendError(res, "Product with this slug already exists", 400);

    const newProduct = await Product.create(req.body);
    return sendSuccess(res, "Product created successfully", newProduct);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getProducts = async (req, res) => {
  try {
    const {
      search,
      slug,
      category,
      type,
      status,
      premium,
      priceStart,
      priceEnd,
      startDate,
      endDate,
      color,
      page = 1,
      limit = 10,
    } = req.body;

    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { subTitle: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { categories: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    if (slug) filter.slug = slug;
    if (category) filter.categories = category;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (typeof premium === "boolean") filter.premium = premium;
    if (color) filter.color = { $regex: new RegExp(`^${color}$`, "i") };

    const minPrice = parseFloat(priceStart);
    const maxPrice = parseFloat(priceEnd);

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.$expr = {
        $and: [
          ...(isNaN(minPrice)
            ? []
            : [{ $gte: [{ $toDouble: "$price" }, minPrice] }]),
          ...(isNaN(maxPrice)
            ? []
            : [{ $lte: [{ $toDouble: "$price" }, maxPrice] }]),
        ],
      };
    }
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date("1970-01-01");
      const end = endDate ? new Date(endDate) : new Date();
      filter.createdAt = { $gte: start, $lte: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    if (products.length === 0) {
      return sendSuccess(res, "No results found", {
        status: 404,
        data: [],
        page: parseInt(page),
        totalPages: 0,
        totalItems: 0,
      });
    }

    return sendSuccess(res, "Products fetched successfully", {
      data: products,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return sendError(res, "Error fetching products", 500);
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Product ID not provided", 404);

    const product = await Product.findById(id);
    if (!product) return sendError(res, "Product not found", 404);

    return sendSuccess(res, "Product fetched successfully", product);
  } catch (error) {
    return sendError(res, "Invalid product ID", 500);
  }
};

export const updateProduct = async (req, res) => {
  try {
    await productValidationSchema.validate(req.body);

    const { id } = req.params;
    if (!id) return sendError(res, "Product ID not provided", 404);

    const product = await Product.findById(id);
    if (!product) return sendError(res, "Product not found", 404);

    const { title, slug } = req.body;

    if (title && title !== product.title) {
      const isExist = await Product.findOne({
        title,
        _id: { $ne: id },
      });
      if (isExist) {
        return sendError(res, "Product with this title already exists", 400);
      }
    }

    if (slug && slug !== product.slug) {
      const isExist = await Product.findOne({
        slug,
        _id: { $ne: id },
      });
      if (isExist) {
        return sendError(res, "Product with this slug already exists", 400);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, "Product updated successfully", updatedProduct);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Product ID not provided", 404);

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return sendError(res, "Product not found", 404);

    return sendSuccess(res, "Product deleted successfully");
  } catch (error) {
    return sendError(res, "Invalid product ID", 500);
  }
};
