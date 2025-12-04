// routes/order.routes.js
const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/roles.middleware");
const { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getPaymentLogs, updatePaymentLogStatus } = require("../controller/order.controller");

// User
router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);

// Admin
router.get("/logs", protect, allowRoles('admin'), getPaymentLogs);
router.post("/logs/update-status", protect, allowRoles('admin'), updatePaymentLogStatus);
router.get("/", protect, allowRoles('admin'), getAllOrders);
router.put("/:id", protect, allowRoles('admin'), updateOrderStatus);

// Get single order (user or admin) - keep after admin routes so '/logs' doesn't match here
router.get("/:id", protect, getOrderById);

module.exports = router;
