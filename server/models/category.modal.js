const mongoose = require("mongoose");
const { Schema } = mongoose;
const slugify = require("slugify");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    slug: {
      type: String,
      unique: true
    },

    image: {
      type: String, // optional banner or icon
      default: null
    }
  },
  { timestamps: true }
);

// Auto-create slug
categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model("Category", categorySchema);
