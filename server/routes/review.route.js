const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");

const {
  addReview,
  getProductReviews,
  deleteReview
} = require("../controller/review.controller");

router.post("/:productId", protect, addReview);
router.get("/:productId", getProductReviews);
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;
