import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";
import { productValidationSchema } from "../validations/productValidation.js";
import Type from "../models/productTypeModel.js";

export const addProduct = async (req, res) => {
  try {
    await productValidationSchema.validate(req.body);

    const {
      title,
      subTitle,
      description,
      originalPrice,
      previewImage,
      originalImage,
      mockupFiles,
      includedFiles,
      fileSizes,
      type,
      categories,
      tags,
      slug,
      premium,
      newArrivals,
      discount,
    } = req.body;

    const exists = await Product.findOne({ slug });
    if (exists)
      return sendError(res, "Product with this slug already exists", 400);

    const parsedOriginal = parseFloat(originalPrice);
    if (isNaN(parsedOriginal) || parsedOriginal < 0) {
      return sendError(
        res,
        "Original price must be a valid non-negative number",
        400
      );
    }

    // ✅ Parse discount (default 0 if not provided)
    const parsedDiscount = parseFloat(discount) || 0;

    // ✅ Calculate final price based on discount
    const finalPrice =
      parsedDiscount > 0
        ? (parsedOriginal - (parsedOriginal * parsedDiscount) / 100).toFixed(2)
        : parsedOriginal.toFixed(2);

    const newProduct = await Product.create({
      title,
      subTitle,
      description,
      originalPrice: parsedOriginal.toFixed(2),
      discount: parsedDiscount,
      price: finalPrice,
      previewImage,
      originalImage,
      mockupFiles,
      includedFiles,
      fileSizes,
      type,
      categories,
      tags,
      slug,
      premium,
      newArrivals,
    });

    return sendSuccess(res, "Product created successfully", newProduct);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// export const addProduct = async (req, res) => {
//   try {
//     await productValidationSchema.validate(req.body);

//     const {
//       title,
//       subTitle,
//       description,
//       originalPrice,
//       previewImage,
//       originalImage,
//       mockupFiles,
//       includedFiles,
//       fileSizes,
//       type,
//       categories,
//       tags,
//       slug,
//       premium,
//       newArrivals,
//     } = req.body;

//     const exists = await Product.findOne({ slug });
//     if (exists)
//       return sendError(res, "Product with this slug already exists", 400);

//     const parsedOriginal = parseFloat(originalPrice);
//     if (isNaN(parsedOriginal) || parsedOriginal < 0) {
//       return sendError(
//         res,
//         "Original price must be a valid non-negative number",
//         400
//       );
//     }

//     const categoryDocs = await Category.find({ name: { $in: categories } });
//     const maxDiscount = Math.max(
//       ...categoryDocs.map((cat) => cat.discount || 0)
//     );

//     const finalPrice =
//       maxDiscount > 0
//         ? (parsedOriginal - (parsedOriginal * maxDiscount) / 100).toFixed(2)
//         : parsedOriginal.toFixed(2);

//     const typeDocs = await Type.find({ _id: { $in: type } });
//     const formattedTypes = typeDocs.map((t) => ({
//       _id: t._id,
//       name: t.name,
//     }));
//     const newProduct = await Product.create({
//       title,
//       subTitle,
//       description,
//       originalPrice: parsedOriginal.toFixed(2),
//       price: finalPrice,
//       previewImage,
//       originalImage,
//       mockupFiles,
//       includedFiles,
//       fileSizes,
//       type: formattedTypes,
//       categories,
//       tags,
//       slug,
//       premium,
//       newArrivals,
//     });

//     return sendSuccess(res, "Product created successfully", newProduct);
//   } catch (error) {
//     console.error("Error adding product:", error);
//     return sendError(res, error.message, 500);
//   }
// };

export const getProducts = async (req, res) => {
  try {
    const {
      search,
      slug,
      category,
      type,
      status,
      priceStart,
      priceEnd,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort,
      premium,
      newArrivals,
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

    if (premium !== undefined) {
      filter.premium = premium === true || premium === "true";
    }
    if (newArrivals !== undefined) {
      filter.newArrivals = newArrivals === true || newArrivals === "true";
    }

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

    let sortOption = {};

    switch (sort) {
      case "price_low_to_high":
        sortOption = { price: 1 };
        break;
      case "price_high_to_low":
        sortOption = { price: -1 };
        break;
      case "new_to_old":
        sortOption = { createdAt: -1 };
        break;
      case "old_to_new":
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = {};
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(parseInt(limit)),
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

// export const getProductById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id) return sendError(res, "Product ID not provided", 404);

//     const product = await Product.findById(id);
//     if (!product) return sendError(res, "Product not found", 404);

//     return sendSuccess(res, "Product fetched successfully", product);
//   } catch (error) {
//     return sendError(res, error.message, 500);
//   }
// };

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Product ID not provided", 404);

    const product = await Product.findById(id)
      .populate({
        path: "type",
        model: Type,
        select: "name",
      })
      .populate({
        path: "categories",
        model: Category,
        select: "name",
      });

    if (!product) return sendError(res, "Product not found", 404);

    const formattedProduct = {
      ...product.toObject(),
      type: product.type.map((t) => t.name),
      categories: product.categories.map((c) => c.name),
    };

    return sendSuccess(res, "Product fetched successfully", formattedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return sendError(res, error.message, 500);
  }
};

export const updateProduct = async (req, res) => {
  try {
    await productValidationSchema.validate(req.body);

    const { id } = req.params;
    if (!id) return sendError(res, "Product ID not provided", 404);

    const existingProduct = await Product.findById(id);
    if (!existingProduct) return sendError(res, "Product not found", 404);

    const { title, slug } = req.body;

    // Check for duplicate title
    if (title && title !== existingProduct.title) {
      const isExist = await Product.findOne({
        title,
        _id: { $ne: id },
      });
      if (isExist) {
        return sendError(res, "Product with this title already exists", 400);
      }
    }

    // Check for duplicate slug
    if (slug && slug !== existingProduct.slug) {
      const isExist = await Product.findOne({
        slug,
        _id: { $ne: id },
      });
      if (isExist) {
        return sendError(res, "Product with this slug already exists", 400);
      }
    }

    // ✅ Handle price and discount updates
    let originalPrice = req.body.originalPrice ?? existingProduct.originalPrice;
    let discount =
      req.body.discount !== undefined
        ? parseFloat(req.body.discount)
        : existingProduct.discount || 0;

    const categories = req.body.categories ?? existingProduct.categories;

    const parsedOriginal = parseFloat(originalPrice);
    if (isNaN(parsedOriginal) || parsedOriginal < 0) {
      return sendError(
        res,
        "Original price must be a valid non-negative number",
        400
      );
    }

    const parsedDiscount = isNaN(discount) ? 0 : discount;

    // ✅ Combine category-based discount with product discount (use whichever is greater)
    const categoryDocs = await Category.find({ name: { $in: categories } });
    const categoryDiscount = Math.max(
      ...categoryDocs.map((cat) => cat.discount || 0),
      0
    );

    const finalDiscount = Math.max(parsedDiscount, categoryDiscount);

    // ✅ Calculate final price
    const finalPrice =
      finalDiscount > 0
        ? (parsedOriginal - (parsedOriginal * finalDiscount) / 100).toFixed(2)
        : parsedOriginal.toFixed(2);

    req.body.price = finalPrice;
    req.body.discount = finalDiscount;
    req.body.originalPrice = parsedOriginal.toFixed(2);

    // ✅ Update product
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, "Product updated successfully", updatedProduct);
  } catch (error) {
    console.error(error);
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
