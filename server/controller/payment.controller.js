const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order.modal");
const Cart = require('../models/cart.modal');
const PaymentLog = require('../models/log.modal');
const User = require('../models/User.modal');

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

// Create Razorpay order (no DB order yet; that happens on verify)
exports.createOrder = async (req, res) => {
  try {


    if (!razorpay) {
      console.error('🔴 createOrder: Razorpay not initialized');
      return res.status(400).json({ success: false, message: "Razorpay is not configured. Please contact support." });
    }

    // Require authenticated user
    const userId = req.user.id;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      console.error('🔴 createOrder: Invalid amount');
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Create razorpay order
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: { userId: userId.toString() }
    };
    const rpOrder = await razorpay.orders.create(options);

    res.status(200).json({ success: true, orderId: rpOrder.id, amount: rpOrder.amount, currency: rpOrder.currency });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create order", error: err.message });
  }
};

// Verify payment signature and create the Order + PaymentLog + send email
exports.verifyPayment = async (req, res) => {
  try {

    if (!razorpay) {
      console.error('🔴 verifyPayment: Razorpay not initialized');
      return res.status(400).json({ success: false, message: "Razorpay is not configured." });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized - user not found' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, selectedAddressId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('🔴 verifyPayment: Signature mismatch');
      return res.status(400).json({ success: false, message: 'Payment verification failed (signature mismatch)' });
    }

    // Fetch cart and address to build order
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    const Address = require('../models/address.modal');
    const address = await Address.findById(selectedAddressId);

    if (!cart || !cart.items || cart.items.length === 0) {
      console.error('🔴 verifyPayment: Cart is empty');
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    if (!address) {
      console.error('🔴 verifyPayment: Address not found');
      return res.status(400).json({ success: false, message: 'Address not found' });
    }

    // Build order items and total
    let totalAmount = 0;
    const orderItems = [];
    for (const item of cart.items) {
      if (!item.product || item.product.stock < item.quantity) {
        console.error('🔴 verifyPayment: Product out of stock');
        return res.status(400).json({ success: false, message: `${item.product?.title} out of stock` });
      }
      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      });
      totalAmount += item.product.price * item.quantity;
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress: address,
      paymentMethod: 'Razorpay',
      totalAmount,
      paymentStatus: 'paid',
      orderStatus: 'processing'
    });

    // Reduce stock
    for (const item of cart.items) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Create PaymentLog
    try {
      await PaymentLog.create({
        user: userId,
        order: order._id,
        amount: totalAmount,
        currency: 'INR',
        paymentMethod: 'Razorpay',
        paymentId: razorpay_payment_id,
        status: 'success',
        providerResponse: { razorpay_order_id }
      });
    } catch (plErr) {
      console.error('🔴 verifyPayment: Failed to create PaymentLog:', plErr.message);
    }

    // Send confirmation email
    try {
      const user = await User.findById(userId);
      if (user) {
        const populatedOrder = await Order.findById(order._id).populate('items.product');
        const { sendOrderConfirmationEmail } = require('../services/emailService');
        await sendOrderConfirmationEmail(user, populatedOrder);
      }
    } catch (emailErr) {
      console.error('🔴 verifyPayment: Email error:', emailErr.message);
    }

    res.status(200).json({ success: true, message: 'Payment verified, order created', orderId: order._id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Payment verification failed", error: err.message });
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
      const rp_order_id = payment.order_id;

      // fetch razorpay order to get receipt
      const rpOrder = await razorpay.orders.fetch(rp_order_id);
      const receipt = rpOrder.receipt;

      const order = await Order.findById(receipt);
      if (order) {
        order.paymentStatus = 'paid';
        order.paymentMethod = 'Razorpay';
        await order.save();

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
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).send('error');
  }
};
