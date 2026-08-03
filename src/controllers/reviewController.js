import Review from "../models/Review.js";

// Create a review — any logged-in user, published immediately
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const review = await Review.create({
      user: req.user._id,
      name: req.user.name,
      rating,
      comment: comment.trim(),
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all reviews — newest first, public
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update a review — only the review's own author can edit it
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this review" });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({ message: "Comment cannot be empty" });
      }
      review.comment = comment.trim();
    }

    await review.save();
    return res.json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete a review — only the review's own author (or admin) can remove it
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(req.params.id);
    return res.json({ message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};