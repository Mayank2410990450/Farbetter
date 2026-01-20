const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/roles.middleware");
const {
    createCoupon,
    getAllCoupons,
    deleteCoupon,
    validateCoupon,
} = require("../controller/coupon.controller");

// PUBLIC
router.post("/validate", validateCoupon);

// ADMIN ONLY
router.get("/", protect, allowRoles("admin"), getAllCoupons);
router.post("/", protect, allowRoles("admin"), createCoupon);
router.delete("/:id", protect, allowRoles("admin"), deleteCoupon);

module.exports = router;
