const express = require("express");
const router = express.Router();
const {
    getTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} = require("../controller/testimonial.controller");
const protect = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/roles.middleware");
const admin = allowRoles("admin"); // Create admin middleware
const upload = require("../middlewares/upload"); // using existing upload middleware

router.get("/", getTestimonials);
router.post("/", protect, admin, upload.single("image"), createTestimonial);
router.put("/:id", protect, admin, upload.single("image"), updateTestimonial);
router.delete("/:id", protect, admin, deleteTestimonial);

module.exports = router;
