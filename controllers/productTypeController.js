import productType from "../models/productTypeModel.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { productTypeValidationSchema } from "../validations/productTypeValidation.js";

export const addProductType = async (req, res) => {
  try {
    await productTypeValidationSchema.validate(req.body);

    const { name } = req.body;

    const exists = await productType.findOne({ name });
    if (exists) return sendError(res, "Product Type already exists", 400);

    const newProductType = await productType.create(req.body);
    return sendSuccess(
      res,
      "Product Type created successfully",
      newProductType
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getProductType = async (req, res) => {
  try {
    const { search, name } = req.body;

    let filter = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    if (name) {
      filter.name = name;
    }

    const filteredProductType = await productType.find(filter);
    if (search && filteredProductType.length === 0) {
      return sendSuccess(res, "No result found", filteredProductType);
    }

    return sendSuccess(
      res,
      "Product Type fetched successfully",
      filteredProductType
    );
  } catch (error) {
    return sendError(res, "Invalid Product Type ID", 500);
  }
};

export const getProductTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not found", 404);

    const type = await productType.findById(id);
    if (!type) return sendError(res, "Product Type not found", 404);

    return sendSuccess(res, "Product Type fetched successfully", type);
  } catch (error) {
    return sendError(res, "Invalid Product Type ID", 400);
  }
};

export const updateProductType = async (req, res) => {
  try {
    await productTypeValidationSchema.validate(req.body);

    const { id } = req.params;
    const { name } = req.body;

    if (!id) return sendError(res, "Id not found", 404);

    const type = await productType.findById(id);
    if (!type) return sendError(res, "Product Type not found", 404);

    if (name && name !== type.name) {
      const isExist = await productType.findOne({
        name,
        _id: { $ne: id },
      });
      if (isExist) {
        return sendError(
          res,
          "Product Type with this title already exists",
          400
        );
      }
    }

    const updated = await productType.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, "Product Type updated successfully", updated);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const deleteProductType = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return sendError(res, "Id not found", 404);

    const deleted = await productType.findByIdAndDelete(id);
    if (!deleted) return sendError(res, "Product Type not found", 404);

    return sendSuccess(res, "Product Type deleted successfully");
  } catch (error) {
    return sendError(res, "Invalid Product Type ID", 400);
  }
};
