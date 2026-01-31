const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Items placed in order
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],

    // Shipping details (copied from user's selected address)
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true }
    },

    // Payment information
    paymentMethod: {
      type: String,
      enum: ["COD", "Stripe", "Razorpay", "PayPal"],
      default: "COD"
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },

    // Order progress
    orderStatus: {
      type: String,
      enum: ["pending_payment", "processing", "shipped", "delivered", "cancelled"],
      default: "processing"
    },

    // Total amount charged
    totalAmount: {
      type: Number,
      required: true
    },

    // Shipping cost for this order
    shippingCost: {
      type: Number,
      default: 0,
      min: 0
    },

    // Idempotency: prevent duplicates
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values for old orders
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
