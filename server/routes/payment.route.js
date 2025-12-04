const express = require("express");
const { createOrder, verifyPayment, getPaymentDetails, webhookHandler } = require("../controller/payment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Protected routes (require authentication)
router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);

// webhook - needs raw body parser, will be used by Razorpay (no auth needed)
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// Protected routes
router.get("/payment/:paymentId", authMiddleware, getPaymentDetails);

module.exports = router;
