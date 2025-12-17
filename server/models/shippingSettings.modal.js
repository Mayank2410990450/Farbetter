const mongoose = require("mongoose");

const shippingSettingsSchema = new mongoose.Schema(
  {
    // Global shipping cost for all orders
    shippingCost: {
      type: Number,
      default: 0,
      min: 0
    },

    // Free shipping threshold (if order total exceeds this, shipping is free)
    freeShippingThreshold: {
      type: Number,
      default: null,
      min: 0
    },

    // Description of shipping policy
    description: {
      type: String,
      default: "Standard shipping applied to all orders"
    },

    // Whether Cash on Delivery is enabled
    codEnabled: {
      type: Boolean,
      default: true
    },

    // Last updated timestamp
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShippingSettings", shippingSettingsSchema);
