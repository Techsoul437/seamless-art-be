import Blog from "../models/blogModel.js";

export const createBlog = async (req, res) => {
  try {
    const { title, description, category, date, time, image } = req.body;
    if (!title || !description || !category || !date || !time || !image) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const blogExists = await Blog.findOne({ title });
    if (blogExists) {
      return res.status(400).json({ success: false, message: "Blog with this title already exists" });
    }

    const blog = new Blog({ title, description, category, date, time, image });
    await blog.save();

    res.status(201).json({ success: true, message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
