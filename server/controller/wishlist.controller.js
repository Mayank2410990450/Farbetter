const Wishlist = require("../models/wishlist.modal");
const mongoose = require("mongoose");
const asyncHandler = require("../middlewares/asyncHandler");


exports.addToWishlist = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [productId]
    });
  } else {
    if (wishlist.products.includes(productId)) {
      return res.json({ message: "Already in wishlist" });
    }

    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.json({
    success: true,
    message: "Added to wishlist",
    wishlist
  });
});


exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    return res.status(404).json({ success: false, message: "Wishlist not found" });
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );

  await wishlist.save();

  res.json({ success: true, message: "Removed from wishlist", wishlist });
});

exports.getWishlist = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const wishlist = await Wishlist.findOne({ user: userId })
    .populate("products", "title price image");

  res.json({
    success: true,
    wishlist: wishlist || { products: [] }
  });
});
