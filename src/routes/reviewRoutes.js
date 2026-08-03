import express from "express";
import { protect } from "../middlewares/authMiddlewares.js";
import { createReview, getReviews, deleteReview } from "../controllers/reviewController.js";

const router = express.Router();

// Public — anyone can read reviews
router.get("/", getReviews);

// Protected — must be logged in to post
router.post("/", protect, createReview);

// Protected — must own the review (or be admin) to delete
router.delete("/:id", protect, deleteReview);

export default router;