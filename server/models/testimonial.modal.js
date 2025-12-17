const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        role: {
            type: String,
            default: "Verified Customer"
        },
        content: {
            type: String,
            required: true,
            maxLength: 500
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            default: 5
        },
        image: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
