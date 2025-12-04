const Review = require("../models/review.modal");
const Product = require("../models/Product.modal");
const asyncHandler = require("../middlewares/asyncHandler");

// Add Review
exports.addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  
  const userId = req.user.id;

  // Check if user already reviewed
  const existingReview = await Review.findOne({ user: userId, product: productId });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this product."
    });
  }

  // Create review
  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    comment
  });

  // Update product rating stats
  const reviews = await Review.find({ product: productId });

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    averageRating: avgRating,
    numReviews: reviews.length
  });

  res.json({
    success: true,
    message: "Review added successfully",
    review
  });
});

// Get reviews for product
exports.getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { sort = "latest", rating, page = 1, limit = 5 } = req.query;

  const query = { product: productId };
  if (rating) query.rating = Number(rating);

  let sortRule = { createdAt: -1 };
  if (sort === "highest") sortRule = { rating: -1 };
  if (sort === "lowest") sortRule = { rating: 1 };
  if (sort === "helpful") sortRule = { helpfulVotes: -1 };

  const reviews = await Review.find(query)
    .populate("user", "name")
    .sort(sortRule)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Review.countDocuments(query);

  res.json({
    success: true,
    reviews,
    pagination: {
      page: Number(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});


// Delete review
exports.deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId, user: req.user.id });

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found"
    });
  }

  await review.deleteOne();

  res.json({ success: true, message: "Review deleted" });
});
