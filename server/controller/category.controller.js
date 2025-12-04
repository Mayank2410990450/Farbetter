const Category = require("../models/category.modal");
const asyncHandler = require("../middlewares/asyncHandler");

// -----------------------------------------------------
// @desc    Create Category (ADMIN)
// @route   POST /api/categories
// -----------------------------------------------------
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  // Check duplicate
  const exists = await Category.findOne({ name });
  if (exists) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = await Category.create({ name, image });

  res.status(201).json({
    message: "Category created successfully",
    category
  });
});

// -----------------------------------------------------
// @desc    Get all categories (PUBLIC)
// @route   GET /api/categories
// -----------------------------------------------------
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json({ categories });
});

// -----------------------------------------------------
// @desc    Get single category by slug (PUBLIC)
// @route   GET /api/categories/:slug
// -----------------------------------------------------
exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.json({ category });
});

// -----------------------------------------------------
// @desc    Update category (ADMIN)
// @route   PUT /api/categories/:id
// -----------------------------------------------------
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  if (name) category.name = name;
  if (image) category.image = image;

  await category.save();

  res.json({
    message: "Category updated successfully",
    category
  });
});

// -----------------------------------------------------
// @desc    Delete category (ADMIN)
// @route   DELETE /api/categories/:id
// -----------------------------------------------------
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  await category.deleteOne();

  res.json({ message: "Category deleted successfully" });
});
