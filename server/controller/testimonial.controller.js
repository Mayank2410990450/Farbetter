const Testimonial = require("../models/testimonial.modal");
const asyncHandler = require("../middlewares/asyncHandler");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getTestimonials = asyncHandler(async (req, res) => {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
});

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
exports.createTestimonial = asyncHandler(async (req, res) => {
    const { name, role, content, rating } = req.body;

    let imageUrl = "";

    if (req.file) {
        const uploadImage = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "farbetter/testimonials",
                        width: 200,
                        height: 200,
                        crop: "fill",
                        gravity: "face",
                        quality: "auto",
                        fetch_format: "auto"
                    },
                    (error, result) => {
                        if (result) resolve(result.secure_url);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        try {
            imageUrl = await uploadImage();
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            // Proceed without image if fail, or error out? Let's proceed.
        }
    }

    const testimonial = await Testimonial.create({
        name,
        role: role || "Verified Customer",
        content,
        rating: Number(rating) || 5,
        image: imageUrl
    });

    res.status(201).json({
        success: true,
        message: "Testimonial created",
        testimonial
    });
});

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
exports.updateTestimonial = asyncHandler(async (req, res) => {
    const { name, role, content, rating } = req.body;
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    testimonial.name = name || testimonial.name;
    testimonial.role = role || testimonial.role;
    testimonial.content = content || testimonial.content;
    if (rating) testimonial.rating = Number(rating);

    if (req.file) {
        const uploadImage = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "farbetter/testimonials",
                        width: 200,
                        height: 200,
                        crop: "fill",
                        gravity: "face",
                        quality: "auto",
                        fetch_format: "auto"
                    },
                    (error, result) => {
                        if (result) resolve(result.secure_url);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        try {
            const imageUrl = await uploadImage();
            testimonial.image = imageUrl;
        } catch (err) {
            console.error("Cloudinary upload error:", err);
        }
    }

    const updatedTestimonial = await testimonial.save();
    res.json({
        success: true,
        message: "Testimonial updated",
        testimonial: updatedTestimonial
    });
});

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
exports.deleteTestimonial = asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    res.json({ success: true, message: "Testimonial deleted" });
});
