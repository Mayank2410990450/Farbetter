const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} = require("../controller/category.controller");

const protect = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/roles.middleware");

// PUBLIC ROUTES
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

// ADMIN ROUTES
router.post(
  "/create",
  protect,
  allowRoles('admin'),
  createCategory
);

router.put(
  "/:id",
  protect,
  allowRoles('admin'),
  updateCategory
);

router.delete(
  "/:id",
  protect,
  allowRoles('admin'),
  deleteCategory
);

module.exports = router;
