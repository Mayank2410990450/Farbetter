const Cart = require("../models/cart.modal");
const mongoose = require("mongoose");
const Product = require("../models/Product.modal");
const asyncHandler = require("../middlewares/asyncHandler");

// ------------------------------------------
// ADD ITEM TO CART
// ------------------------------------------
exports.addToCart = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity }],
    });

    await cart.populate("items.product", "title price image");
    return res.json({ message: "Added to cart", cart });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate("items.product", "title price image");

  res.json({ message: "Cart updated", cart });
});


// ------------------------------------------
// GET USER CART
// ------------------------------------------
exports.getCart = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "title price image"
  );

  res.json(cart || { items: [] });
});

// ------------------------------------------
// UPDATE ITEM QUANTITY
// ------------------------------------------
exports.updateQuantity = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const { productId, quantity } = req.body;

  if (quantity < 1)
    return res.status(400).json({ message: "Quantity must be at least 1" });

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item)
    return res.status(404).json({ message: "Product not in cart" });

  item.quantity = quantity;

  await cart.save();
  await cart.populate("items.product", "title price image");

  res.json({ message: "Quantity updated", cart });
});


// ------------------------------------------
// REMOVE ITEM FROM CART
// ------------------------------------------
exports.removeItem = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  await cart.populate("items.product", "title price image");

  res.json({ message: "Item removed", cart });
});


// ------------------------------------------
// CLEAR USER CART
// ------------------------------------------
exports.clearCart = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  await Cart.findOneAndUpdate(
    { user: userId },
    { items: [] }
  );

  res.json({ message: "Cart cleared" });
});
