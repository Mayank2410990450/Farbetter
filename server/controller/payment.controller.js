const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order.modal");
const Cart = require('../models/cart.modal');
const PaymentLog = require('../models/log.modal');
const User = require('../models/User.modal');
const Address = require('../models/address.modal');

// Initialize Razorpay only if credentials are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('⚠️  Razorpay not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env to enable payments.');
}

// Create Razorpay order AND MongoDB Order (status: pending)
exports.createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      console.error('🔴 createOrder: Razorpay not initialized');
      return res.status(400).json({ success: false, message: "Razorpay is not configured." });
    }

    const userId = req.user.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { amount, selectedAddressId, shippingCost = 0, couponCode, discountAmount = 0 } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // 1. Fetch Cart & Address
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    const Address = require('../models/address.modal');
    const address = await Address.findById(selectedAddressId);

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: 'Invalid address' });
    }

    // 2. Prepare Order Items
    const orderItems = [];
    for (const item of cart.items) {
      if (!item.product) continue;
      // We do NOT check stock here strictly or reduce it yet, 
      // but ideally we should checking stock. 
      // For now, let's proceed to allow payment.
      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      });
    }

    // 3. Create Pending MongoDB Order
    const dbOrder = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress: address,
      paymentMethod: 'Razorpay',
      totalAmount: amount, // Assumed to include shipping - discount
      shippingCost,
      paymentStatus: 'pending',
      orderStatus: 'pending_payment' // Special status indicating not yet verified
    });

    // 4. Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: dbOrder._id.toString(), // LINK DB ORDER ID HERE
      notes: {
        userId: userId.toString(),
        dbOrderId: dbOrder._id.toString()
      }
    };
    const rpOrder = await razorpay.orders.create(options);

    // Save Razorpay Order ID to DB Order for reference (optional, but good for tracking)
    // We can use 'paymentId' field temporarily or just rely on receipt
    dbOrder.paymentId = rpOrder.id;
    await dbOrder.save();

    res.status(200).json({
      success: true,
      orderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      dbOrderId: dbOrder._id // Send back to frontend
    });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ success: false, message: "Failed to create order", error: err.message });
  }
};

// Verify payment signature and UPDATE the existing Order
exports.verifyPayment = async (req, res) => {
  try {
    if (!razorpay) return res.status(400).json({ success: false, message: "Razorpay missing" });

    const userId = req.user?.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Signature mismatch' });
    }

    // Find the existing pending order
    // If dbOrderId is provided, use it. Otherwise try to find one with this Razorpay Order ID?
    // We prefer dbOrderId.
    const order = await Order.findById(dbOrderId || req.body.receipt); // fallback

    if (!order) {
      // Fallback: If for some reason checking out without dbOrderId (legacy), we might fail.
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus === 'paid') {
      return res.json({ success: true, message: "Order already paid", orderId: order._id });
    }

    // Mark as Paid
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    order.paymentId = razorpay_payment_id; // Update with actual Payment ID
    await order.save();

    // Reduce stock and clear cart (Logic moved from create to verify)
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (cart) {
      for (const item of cart.items) {
        if (item.product) {
          item.product.stock = Math.max(0, item.product.stock - item.quantity);
          await item.product.save();
        }
      }
      cart.items = [];
      await cart.save();
    }

    // Create PaymentLog
    try {
      await PaymentLog.create({
        user: userId,
        order: order._id,
        amount: order.totalAmount,
        currency: 'INR',
        paymentMethod: 'Razorpay',
        paymentId: razorpay_payment_id,
        status: 'success',
        providerResponse: { razorpay_order_id }
      });
    } catch (plErr) { console.error('Log Error:', plErr.message); }

    // Send confirmation email
    try {
      const user = await User.findById(userId);
      if (user) {
        const populatedOrder = await Order.findById(order._id).populate('items.product');
        const { sendOrderConfirmationEmail } = require('../services/emailService');
        await sendOrderConfirmationEmail(user, populatedOrder);
      }
    } catch (emailErr) { console.error('Email Error:', emailErr.message); }

    res.status(200).json({ success: true, message: 'Payment verified', orderId: order._id });

  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ success: false, message: "Verification failed", error: err.message });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(400).json({ success: false, message: "Razorpay is not configured." });
    }

    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ success: false, message: "Failed to fetch payment", error: err.message });
  }
};

// Webhook handler (raw body required)
exports.webhookHandler = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body; // raw buffer when route uses express.raw

    if (secret) {
      const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
      if (expected !== signature) {
        console.warn('Invalid webhook signature');
        return res.status(400).send('invalid signature');
      }
    }

    const payload = JSON.parse(body.toString());
    const event = payload.event;

    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const rp_order_id = payment.order_id; // Razorpay Order ID

      // Helper: Find order by receipt (DB ID) or by paymentId if we saved it
      // Note: We used receipt = dbOrder._id in createOrder
      let order = null;

      try {
        const rpOrder = await razorpay.orders.fetch(rp_order_id);
        if (rpOrder.receipt) {
          // Try to find by receipt (DB ID)
          try {
            order = await Order.findById(rpOrder.receipt);
          } catch (e) { console.log("Webhook: Receipt is not a valid ObjectId"); }
        }
      } catch (e) {
        console.error("Webhook: Failed to fetch RP order", e.message);
      }

      if (order && order.paymentStatus !== 'paid') {
        console.log(`Webhook: Marking order ${order._id} as paid`);
        order.paymentStatus = 'paid';
        order.orderStatus = 'processing';
        order.paymentMethod = 'Razorpay';
        order.paymentId = payment.id;
        await order.save();

        // Also clear cart if we can find the user?
        // We know user from order.user
        if (order.user) {
          const Cart = require('../models/cart.modal');
          await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
        }

        try {
          await PaymentLog.create({
            user: order.user,
            order: order._id,
            amount: order.totalAmount,
            currency: 'INR',
            paymentMethod: 'Razorpay',
            paymentId: payment.id,
            status: 'success',
            providerResponse: payment
          });
        } catch (e) { }

        // send email
        try {
          const user = await User.findById(order.user);
          if (user) {
            const { sendOrderConfirmationEmail } = require('../services/emailService');
            const populatedOrder = await Order.findById(order._id).populate('items.product');
            await sendOrderConfirmationEmail(user, populatedOrder);
          }
        } catch (e) {
          console.error('Webhook email send error:', e.message);
        }
      } else {
        console.log("Webhook: Order not found or already paid for RP Order:", rp_order_id);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).send('error');
  }
};
