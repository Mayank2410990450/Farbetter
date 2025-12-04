const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");

const {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require("../controller/wishlist.controller");

router.post("/add", protect, addToWishlist);
router.post("/remove", protect, removeFromWishlist);
router.get("/", protect, getWishlist);

module.exports = router;
