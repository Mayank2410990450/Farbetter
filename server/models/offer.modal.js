const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      required: true,
    },
    backgroundColor: {
      type: String,
      default: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    icon: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);
module.exports = Offer;
