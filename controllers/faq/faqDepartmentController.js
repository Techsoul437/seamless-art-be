import { faqDepartmentValidationSchema } from "../../validations/faqValidation.js";
import { FaqDepartment } from "../../models/faqModel.js";
import { sendSuccess, sendError } from "../../utils/responseHelper.js";

export const addFaqDepartment = async (req, res) => {
  try {
    await faqDepartmentValidationSchema.validate(req.body);
    const { name } = req.body;

    const exists = await FaqDepartment.findOne({ name });
    if (exists) return sendError(res, "Department already exists", 400);

    const department = await FaqDepartment.create({ name });
    return sendSuccess(res, "Department created successfully", department);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};

export const getAllFaqDepartments = async (req, res) => {
  try {
    const departments = await FaqDepartment.find().sort({ createdAt: -1 });
    const message =
      departments.length > 0
        ? "Departments fetched successfully"
        : "No departments found";

    return sendSuccess(res, message, departments);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 500);
  }
};

export const getFaqDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not found", 404);

    const department = await FaqDepartment.findById(id);
    if (!department) return sendError(res, "Department not found", 404);

    return sendSuccess(res, "Department fetched successfully", department);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 400);
  }
};

export const updateFaqDepartment = async (req, res) => {
  try {
    await faqDepartmentValidationSchema.validate(req.body);

    const { id } = req.params;
    const { name } = req.body;

    if (!id) return sendError(res, "Id not found", 404);

    const department = await FaqDepartment.findById(id);
    if (!department) return sendError(res, "Department not found", 404);

    const exists = await FaqDepartment.findOne({ name, _id: { $ne: id } });
    if (exists)
      return sendError(res, "Department with this name already exists", 400);

    department.name = name;
    await department.save();

    return sendSuccess(res, "Department updated successfully", department);
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 400);
  }
};

export const deleteFaqDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendError(res, "Id not found", 404);

    const department = await FaqDepartment.findByIdAndDelete(id);
    if (!department) return sendError(res, "Department not found", 404);

    return sendSuccess(res, "Department deleted successfully");
  } catch (error) {
    console.error(error.message);
    return sendError(res, error.message, 400);
  }
};
