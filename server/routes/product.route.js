const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const  protect  = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/roles.middleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock
} = require("../controller/product.controller");

// PUBLIC
router.get("/", getProducts);
router.get("/:id", getProductById);

// ADMIN ONLY
router.post("/create", protect, allowRoles('admin'), upload.single("image"), createProduct);
router.put("/update/:id", protect, allowRoles('admin'), upload.single("image"), updateProduct);
router.put("/stock/:id", protect, allowRoles('admin'), updateStock);
router.delete("/delete/:id", protect, allowRoles('admin'), deleteProduct);

module.exports = router;
