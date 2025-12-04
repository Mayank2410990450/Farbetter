const express = require("express");
const { getShippingSettings, updateShippingSettings } = require("../controller/shipping.controller");
const protect = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/roles.middleware");

const router = express.Router();

// Public route - get shipping settings
router.get("/", getShippingSettings);

// Admin only - update shipping settings
router.post("/", protect, allowRoles("admin"), updateShippingSettings);

module.exports = router;
