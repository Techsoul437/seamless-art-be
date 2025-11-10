import Review from "../models/reviewModel.js";
import { sendError, sendSuccess } from "../utils/responseHelper.js";

export const addReview = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return sendError(res, "Unauthorized user", 401);

    const { image, title, content, location, stars } = req.body;

    if (!image || !title || !content || !location || !stars)
      return sendError(res, "All fields are required", 400);

    const reviewData = {
      image,
      userImage: user.image?.url || "https://example.com/default-user.jpg",
      title,
      content,
      author: user.name || user.username,
      location,
      stars,
      userId: user._id,
    };

    const review = new Review(reviewData);
    await review.save();

    return sendSuccess(res, "Review added successfully", review);
  } catch (error) {
    return sendError(res, error.message || "Failed to add review");
  }
};

export const getReviews = async (req, res) => {
  try {
    const { sortByStars } = req.body || {};
    const sortOption = sortByStars ? { stars: -1 } : { createdAt: -1 };
    const reviews = await Review.find().sort(sortOption);
    return sendSuccess(res, "Reviews fetched successfully", reviews);
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch reviews");
  }
};

export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return sendError(res, "Review not found", 404);
    return sendSuccess(res, "Review fetched successfully", review);
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch review");
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Review.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return sendError(res, "Review not found", 404);
    return sendSuccess(res, "Review updated successfully", updated);
  } catch (error) {
    return sendError(res, error.message || "Failed to update review");
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) return sendError(res, "Review not found", 404);
    return sendSuccess(res, "Review deleted successfully", deleted);
  } catch (error) {
    return sendError(res, error.message || "Failed to delete review");
  }
};
