const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const passport = require("passport");

// Load environment variables FIRST before anything else
dotenv.config();

// Now load passport config after env vars are loaded
require("./config/passport.js");

const userRoutes = require("./routes/user.route");
const productRoutes = require("./routes/product.route");
const cateoryRoutes = require("./routes/category.route");
const orderRoutes = require("./routes/order.route");
const addressroutes = require("./routes/address.route");
const cartRoutes = require("./routes/cart.route");
const wishlistRoutes = require("./routes/whishlist.route");
const reviewRoutes = require("./routes/review.route");
const paymentRoutes = require("./routes/payment.route");
const offerRoutes = require("./routes/offer.route");
const contactRoutes = require("./routes/contact.route");
const shippingRoutes = require("./routes/shipping.route");
const debugRoutes = require("./routes/debug.route");
const couponRoutes = require("./routes/coupon.route");

const app = express();

// ===== MIDDLEWARE =====

const compression = require("compression");

// Secure HTTP headers
app.use(helmet());
app.use(compression());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);


    const allowedOrigins = [
      'https://www.farbetterstore.com',
      'https://farbetterstore.com',
      'http://localhost:5173',
      'http://localhost:5000',
      'https://farbetter-438e6j399-mayanks-projects-c2e595e7.vercel.app'
    ];




    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('⚠️  CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS')); // Block unauthorized origins
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  exposedHeaders: ["set-cookie"]
}));
// Parse incoming JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// ===== ROUTES =====
app.use("/api/user", userRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", cateoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressroutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/testimonials", require("./routes/testimonial.route"));
app.use("/api/coupons", couponRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Ecommerce API Running...");
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ===== DATABASE CONNECTION =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {

    // Seed single admin user if configured and none exists
    try {
      const Admin = require('./models/User.modal');
      const Offer = require('./models/offer.modal');
      const bcrypt = require('bcrypt');
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (adminEmail && adminPassword) {
        const existingAdmin = await Admin.findOne({ role: 'admin' });
        if (!existingAdmin) {
          const hashed = await bcrypt.hash(adminPassword, 10);
          await Admin.create({
            name: 'Administrator',
            email: adminEmail,
            password: hashed,
            role: 'admin'
          });
        }
      }

      // Seed default offers if none exist
      const existingOffers = await Offer.countDocuments();
      if (existingOffers === 0) {
        const defaultOffers = [
          {
            title: 'Free Shipping',
            description: 'On Orders Above ₹599',
            badge: 'FREE SHIPPING',
            backgroundColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
            icon: true,
            order: 1,
          },
        ];
        await Offer.insertMany(defaultOffers);
      }
    } catch (seedErr) {
      console.error('Seeding error:', seedErr.message);
    }

    const port = process.env.PORT || 5000;
    app.listen(port, () =>
      console.log(`Server running on port ${port}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB Error:", err.message);
  });
