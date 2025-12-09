const resend = require("../config/email");

/**
 * Send order confirmation email to user
 * @param {Object} user - User object with email and name
 * @param {Object} order - Order object with items, totalAmount, etc.
 * @returns {Promise<void>}
 */
exports.sendOrderConfirmationEmail = async (user, order) => {
  try {
    // Check if email is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️  Resend API key not configured. Skipping order confirmation email.");
      return;
    }

    if (!user || !user.email) {
      console.error("❌ sendOrderConfirmationEmail: Missing user or user email.", user);
      return;
    }

    console.log(`📧 Preparing order confirmation email for Order #${order._id} to ${user.email}`);

    // Format order items for email
    const itemsHTML = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">
            <strong>${item.product?.title || "Product"}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">
            ₹${item.price.toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">
            <strong>₹${(item.price * item.quantity).toFixed(2)}</strong>
          </td>
        </tr>
      `
      )
      .join("");

    // Format shipping address
    const addressHTML = order.shippingAddress
      ? `
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Shipping Address</h3>
        <p style="margin: 5px 0;">
          <strong>${order.shippingAddress.fullName}</strong><br>
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
          ${order.shippingAddress.country}<br>
          📞 ${order.shippingAddress.phone}
        </p>
      </div>
    `
      : "";

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
          }
          .email-container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px auto;
            max-width: 600px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #4CAF50;
            font-size: 28px;
          }
          .order-number {
            background-color: #e8f5e9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .order-number p {
            margin: 5px 0;
          }
          .order-status {
            font-weight: bold;
            color: #ff9800;
            font-size: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          table header {
            background-color: #f5f5f5;
          }
          th {
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #ddd;
            font-weight: bold;
          }
          .total-section {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: right;
          }
          .total-amount {
            font-size: 24px;
            color: #4CAF50;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p>Thank you for your order. We're getting it ready to ship!</p>
          </div>

          <div class="order-number">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</p>
            <p><span class="order-status">Status: ${order.status || "Pending"}</span></p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
          </div>

          <h3>Order Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="total-section">
            <p style="margin: 10px 0;"><strong>Subtotal:</strong> ₹${order.totalAmount.toFixed(2)}</p>
            <p style="margin: 10px 0;"><strong>Shipping:</strong> FREE</p>
            <div class="total-amount">Total: ₹${order.totalAmount.toFixed(2)}</div>
          </div>

          ${addressHTML}

          <div style="text-align: center; margin: 20px 0;">
            <p>Track your order on our website:</p>
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/user/dashboard" class="button">
              Track Order
            </a>
          </div>

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0;">What's Next?</h4>
            <ol style="margin-bottom: 0;">
              <li>We'll prepare your order for shipment</li>
              <li>You'll receive a shipping notification</li>
              <li>Track your package in real-time</li>
              <li>We offer free returns within 30 days</li>
            </ol>
          </div>

          <div class="footer">
            <p>📧 If you have any questions, please reply to this email or visit our support center.</p>
            <p>&copy; 2024 Farbetter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Farbetter <onboarding@resend.dev>",
      to: user.email,
      subject: `Order Confirmation - Order #${order._id}`,
      html: htmlContent,
      reply_to: process.env.SUPPORT_EMAIL,
    });

    console.log(`✅ Order confirmation email sent to ${user.email}. ID: ${data.id}`);
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error.message);
    if (error.response) {
      console.error("Resend API Error Response:", error.response.body);
    }
  }
};

/**
 * Send order status update email
 * @param {string} email - User email
 * @param {Object} order - Order object
 * @param {string} status - New order status
 * @returns {Promise<void>}
 */
exports.sendOrderStatusEmail = async (email, order, status) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️  Resend API key not configured. Skipping status update email.");
      return;
    }

    const statusMessages = {
      shipped: "Your order has been shipped! 📦",
      delivered: "Your order has been delivered! 🎉",
      cancelled: "Your order has been cancelled. ❌",
      pending: "Your order is being processed. ⏳",
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; }
          .status-box { background: #e8f5e9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Order Status Update</h2>
          <p>Hello,</p>
          <div class="status-box">
            <h3 style="margin-top: 0;">${statusMessages[status] || "Your order status has been updated"}</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Current Status:</strong> <strong>${status.toUpperCase()}</strong></p>
          </div>
          <p>You can track your order anytime on our website.</p>
          <div class="footer">
            <p>&copy; 2024 Farbetter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Farbetter <onboarding@resend.dev>",
      to: email,
      subject: `Order Status Update - Order #${order._id}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send status update email:", error.message);
  }
};
