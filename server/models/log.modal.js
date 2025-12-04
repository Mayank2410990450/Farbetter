const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: "INR"
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Stripe", "Razorpay", "PayPal"],
      required: true
    },

    paymentId: {
      type: String, // gateway's transaction ID
      // optional: COD orders won't have a payment gateway id
    },

    status: {
      type: String,
      enum: ["success", "failed","pending"],
      default: "pending"
    },

    providerResponse: {
      type: Object, // store raw gateway response (optional)
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentLog", paymentLogSchema);
