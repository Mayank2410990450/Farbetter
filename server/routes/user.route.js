const express = require("express");
const { signin, login, logout ,getUserProfile,updateUserProfile} = require("../controller/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", signin);
router.post("/login", login);

// OAuth Routes (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
    
    if (!req.user) {
      console.error("❌ Google OAuth failed: No user in request");
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=auth_failed`);
    }

    try {
      // Generate JWT token for the user
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
      }
      
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        jwtSecret,
        { expiresIn: "7d" }
      );
      res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?token=${token}`);
    } catch (err) {
      console.error("❌ Google OAuth - Token generation failed:", err.message);
      res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=token_failed`);
    }
  });
}

// PROTECTED ROUTE (ONLY LOGGED IN USERS CAN LOGOUT)
router.get("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

module.exports = router;
