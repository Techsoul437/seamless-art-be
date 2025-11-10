import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../../controllers/blogController.js";

const router = express.Router();

router.post("/create", createBlog);
router.get("/get", getAllBlogs);
router.get("/:id", getBlogById);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;
