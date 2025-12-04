const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    brand: {
      type: String,
    },

    price: {
      type: Number,
      required: true
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    image: { type: String, required: false }, // One image only
    averageRating: {
  type: Number,
  default: 0
},
numReviews: {
  type: Number,
  default: 0
},


    stock: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Product", productSchema);
