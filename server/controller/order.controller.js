
const mongoose = require('mongoose');
const Order = require("../models/order.modal");
const Cart = require("../models/cart.modal");
const Product = require("../models/Product.modal");
const Address = require("../models/address.modal");
const User = require("../models/User.modal");
const PaymentLog = require("../models/log.modal");
const ShippingSettings = require("../models/shippingSettings.modal");
const asyncHandler = require("../middlewares/asyncHandler");
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require("../services/emailService");

// 1️⃣ Place Order
exports.placeOrder = asyncHandler(async (req, res) => {
  console.log('[DEBUG] placeOrder called');
  try {
    const userId = req.user.id;
    const { selectedAddressId, paymentMethod, paymentId, shippingCost } = req.body;
    const shippingCostNumber = Number(shippingCost) || 0;
    console.log('[DEBUG] Payload:', { userId, selectedAddressId, paymentMethod, shippingCost: shippingCostNumber });

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    const address = await Address.findOne({ _id: selectedAddressId, user: userId });
    if (!address) return res.status(400).json({ success: false, message: "Invalid address" });
    console.log('[DEBUG] Address found:', address._id);

    // Validate Payment Method
    if (paymentMethod === "COD") {
      const settings = await ShippingSettings.findOne({});
      if (settings && settings.codEnabled === false) {
        return res.status(400).json({ success: false, message: "Cash on Delivery is currently disabled" });
      }
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product || item.product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `${item.product?.title} out of stock` });

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      });

      totalAmount += item.product.price * item.quantity;

      // Reduce stock
      item.product.stock -= item.quantity;
      await item.product.save();
    }
    console.log('[DEBUG] Stock updated. Total amount calculated:', totalAmount);

    const orderPayload = {
      user: userId,
      items: orderItems,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode
      },
      paymentMethod,
      totalAmount: totalAmount + shippingCostNumber,
      shippingCost: shippingCostNumber,
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid"
    };

    console.log('[DEBUG] Creating order with payload:', JSON.stringify(orderPayload, null, 2));

    const order = await Order.create(orderPayload);
    console.log('[DEBUG] Order created:', order._id);

    // Clear cart
    cart.items = [];
    await cart.save();

    // Log payment if online
    // Create a PaymentLog for every order so admin logs include COD and online orders
    try {
      const logEntry = {
        user: userId,
        order: order._id,
        amount: totalAmount,
        paymentMethod: paymentMethod || 'COD',
        paymentId: paymentId || null,
        status: paymentMethod !== 'COD' && paymentId ? 'success' : (paymentMethod === 'COD' ? 'pending' : 'pending'),
        providerResponse: {}
      };

      await PaymentLog.create(logEntry);
    } catch (logErr) {
      console.error('Failed to create payment log (non-blocking):', logErr.message);
    }

    // Send order confirmation email
    try {
      const user = await User.findById(userId);
      if (user) {
        // Populate order with product details for email
        // Populate order with product details for email
        const populatedOrder = await Order.findById(order._id).populate("items.product");
        sendOrderConfirmationEmail(user, populatedOrder).catch(err => console.error("Email sending error (background):", err.message));
      }
    } catch (emailError) {
      console.error("Email sending error (non-blocking):", emailError.message);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('[DEBUG] placeOrder Error:', error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
});

// 2️⃣ Get user orders
// 2️⃣ Get user orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  console.log(`[DEBUG] getMyOrders called. User ID from token: ${req.user.id}`);

  // Explicitly cast to ObjectId to ensure match
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const orders = await Order.find({ user: userId })
    .populate("items.product", "title images price")
    .sort({ createdAt: -1 });

  console.log(`[DEBUG] Found ${orders.length} orders for user ${req.user.id}`);

  res.json({ success: true, orders });
});

// 2.5️⃣ Get single order by ID
exports.getOrderById = asyncHandler(async (req, res) => {
  // validate id early to avoid cast errors
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid order id" });
  }

  const order = await Order.findById(id)
    .populate("items.product", "title images price");

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Check if user owns this order or is admin
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  res.json({ success: true, order });
});

// 3️⃣ Admin: all orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 }) // Show LATEST first
    .populate("user", "name email")
    .populate("items.product", "title images price");

  res.json({ success: true, orders });
});

// 4️⃣ Update order status (admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  const previousOrderStatus = order.orderStatus;
  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();

  // If order status changed to delivered, automatically update payment log status to success
  if (orderStatus === 'delivered' && previousOrderStatus !== 'delivered') {
    try {
      // Update all payment logs for this order to 'success' status
      const updatedLogs = await PaymentLog.updateMany(
        { order: order._id },
        { $set: { status: 'success' } },
        { new: true }
      );
    } catch (logErr) {
      console.error('Failed to update payment logs on delivery:', logErr.message);
    }
  }

  // If paymentStatus changed, update PaymentLog(s) for this order to keep logs in sync
  try {
    if (paymentStatus && orderStatus !== 'delivered') {
      await PaymentLog.updateMany({ order: order._id }, { $set: { status: paymentStatus } });
    }
  } catch (logErr) {
    console.error('Failed to update payment logs after order status change:', logErr.message);
  }

  // Send status update email
  if (orderStatus && previousOrderStatus !== orderStatus) {
    try {
      const user = await User.findById(order.user);
      if (user) {
        sendOrderStatusEmail(user.email, order, orderStatus).catch(err => console.error("Status email error (background):", err.message));
      }
    } catch (emailErr) {
      console.error("Status email error:", emailErr.message);
    }
  }

  res.json({ success: true, order });
});

// Admin: fetch payment logs
exports.getPaymentLogs = asyncHandler(async (req, res) => {
  try {
    const logs = await PaymentLog.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('user', 'name email')
      .populate('order', 'totalAmount orderStatus');

    // If no payment logs exist yet, fallback to recent orders so admin sees activity
    if (!logs || logs.length === 0) {
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(200)
        .populate('user', 'name email');

      const orderLogs = recentOrders.map((o) => ({
        _id: o._id,
        order: { _id: o._id, totalAmount: o.totalAmount, orderStatus: o.orderStatus },
        user: o.user,
        amount: o.totalAmount,
        currency: 'INR',
        paymentMethod: o.paymentMethod || 'COD',
        paymentId: o.paymentId || null,
        status: o.paymentStatus || 'pending',
        createdAt: o.createdAt,
      }));

      return res.json({ success: true, logs: orderLogs });
    }

    res.json({ success: true, logs });
  } catch (err) {
    console.error('Error fetching payment logs:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch logs', error: err.message });
  }
});

// 4️⃣ Update Payment Log Status (for COD users)
exports.updatePaymentLogStatus = asyncHandler(async (req, res) => {
  const { logId, status } = req.body;

  if (!logId || !status) {
    return res.status(400).json({ success: false, message: 'logId and status are required' });
  }

  // Valid statuses
  const validStatuses = ['pending', 'success', 'failed', 'refunded'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const log = await PaymentLog.findByIdAndUpdate(
      logId,
      { status },
      { new: true }
    ).populate('user', 'name email').populate('order', 'totalAmount orderStatus');

    if (!log) {
      return res.status(404).json({ success: false, message: 'Payment log not found' });
    }

    res.json({ success: true, message: 'Payment log updated', log });
  } catch (err) {
    console.error('Error updating payment log:', err);
    res.status(500).json({ success: false, message: 'Failed to update payment log', error: err.message });
  }
});
