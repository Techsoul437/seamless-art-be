import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { categoryValidationSchema } from "../validations/categoryValidation.js";

export const addCategory = async (req, res) => {
  try {
    await categoryValidationSchema.validate(req.body);

    const { name, image, discount = 0 } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) return sendError(res, "Category already exists", 400);

    const newCategory = await Category.create({ name, image, discount });

    if (discount > 0) {
      const products = await Product.find({ categories: name });

      for (const product of products) {
        const original = parseFloat(product.originalPrice);
        if (!isNaN(original) && original >= 0) {
          const discountedPrice = original - (original * discount) / 100;
          product.price = discountedPrice.toFixed(2);
          await product.save();
        }
      }
    }

    return sendSuccess(res, "Category created successfully", newCategory);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getCategory = async (req, res) => {
  try {
    const { search, name } = req.body;

    let filter = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    if (name) {
      filter.name = name;
    }

    const category = await Category.find(filter).sort({ createdAt: -1 });
    
    if (search && category.length === 0) {
      return sendSuccess(res, "No result found", category);
    }

    return sendSuccess(res, "Category fetched successfully", category);
  } catch (error) {
    return sendError(res, "Invalid category ID", 500);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not found", 404);

    const category = await Category.findById(id);
    if (!category) return sendError(res, "Category not found", 404);

    return sendSuccess(res, "Category fetched successfully", category);
  } catch (error) {
    return sendError(res, "Invalid category ID", 400);
  }
};

export const updateCategory = async (req, res) => {
  try {
    await categoryValidationSchema.validate(req.body);

    const { id } = req.params;
    const { name, image, discount } = req.body;

    if (!id) return sendError(res, "Category Id not found", 404);

    const category = await Category.findById(id);
    if (!category) return sendError(res, "Category not found", 404);

    if (name && name !== category.name) {
      const isExist = await Category.findOne({
        name,
        _id: { $ne: id },
      });
      if (isExist) {
        return sendError(res, "Category with this title already exists", 400);
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (discount >= 0) {
      const products = await Product.find({ categories: category.name });

      for (const product of products) {
        const original = parseFloat(product.originalPrice);
        if (!isNaN(original)) {
          const discountedPrice = original - (original * discount) / 100;
          product.price = discountedPrice.toFixed(2);
          await product.save();
        }
      }
    }

    return sendSuccess(res, "Category updated successfully", updatedCategory);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return sendError(res, "Id not found", 404);

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return sendError(res, "Category not found", 404);

    return sendSuccess(res, "Category deleted successfully");
  } catch (error) {
    return sendError(res, "Invalid category ID", 400);
  }
};
