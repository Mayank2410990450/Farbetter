const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true
    },

    avatar: {
      type: String,
      default: null
    },

    googleId: {
      type: String,
      default: null
    },

    githubId: {
      type: String,
      default: null
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
