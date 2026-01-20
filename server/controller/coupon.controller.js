const Coupon = require("../models/Coupon.modal");
const asyncHandler = require("../middlewares/asyncHandler");

// @desc    Create a new coupon (ADMIN)
// @route   POST /api/coupons
exports.createCoupon = asyncHandler(async (req, res) => {
    const {
        code,
        discountType,
        discountValue,
        minPurchaseAmount,
        expirationDate,
        usageLimit,
    } = req.body;

    if (!code || !discountType || !discountValue || !expirationDate) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields",
        });
    }

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
        return res.status(400).json({
            success: false,
            message: "Coupon code already exists",
        });
    }

    const coupon = await Coupon.create({
        code,
        discountType,
        discountValue,
        minPurchaseAmount: minPurchaseAmount || 0,
        expirationDate,
        usageLimit: usageLimit || null,
    });

    res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        coupon,
    });
});

// @desc    Get all coupons (ADMIN)
// @route   GET /api/coupons
exports.getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, coupons });
});

// @desc    Delete coupon (ADMIN)
// @route   DELETE /api/coupons/:id
exports.deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
        return res.status(404).json({
            success: false,
            message: "Coupon not found",
        });
    }

    res.json({
        success: true,
        message: "Coupon deleted successfully",
    });
});

// @desc    Validate coupon and get discount (USER)
// @route   POST /api/coupons/validate
exports.validateCoupon = asyncHandler(async (req, res) => {
    const { code, cartTotal } = req.body; // cartTotal should be the subtotal

    if (!code) {
        return res.status(400).json({
            success: false,
            message: "Please provide a coupon code",
        });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
        return res.status(404).json({
            success: false,
            message: "Invalid coupon code",
        });
    }

    if (!coupon.isActive) {
        return res.status(400).json({
            success: false,
            message: "This coupon is inactive",
        });
    }

    if (new Date() > new Date(coupon.expirationDate)) {
        return res.status(400).json({
            success: false,
            message: "This coupon has expired",
        });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
            success: false,
            message: "This coupon usage limit has been reached",
        });
    }

    if (cartTotal < coupon.minPurchaseAmount) {
        return res.status(400).json({
            success: false,
            message: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required`,
        });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else {
        // FIXED
        discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed total (mostly relevant for fixed)
    if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
    }

    res.json({
        success: true,
        isValid: true,
        discountAmount,
        couponCode: coupon.code,
        message: "Coupon applied successfully",
    });
});
