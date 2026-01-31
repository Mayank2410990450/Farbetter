const express = require('express');
const router = express.Router();
const { trackVisit, getAnalytics, getStats } = require('../controller/analytics.controller');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public route to track visits
// Note: We might want 'protect' optional middleware to capture user Id if token exists
// But standard 'protect' throws 401. We need a 'loose' protect or we just rely on client to send token if available.
// For simplicity, we make it public and client can send token if they want user tracking.
// If your app uses a global error handler for auth, sending a token to a public route doesn't auto-user it unless middleware does.
// We will modify Server.js or use a soft middleware if we want User ID tracking.
// For now, let's just make it public. Ideally, frontend sends ID if logged in.
// Actually, 'protect' is strict. We will assume only explicit tracking for now.
// If you want user ID, you need a middleware that does `req.user = decoded` but doesn't error if no token.
// Let's create a 'optionalAuth' middleware inline or just skip for now and rely on visitorId.

// Let's implement a simple inline optional auth for this single route logic if needed, 
// OR just trust the frontend to send user ID? No, safer to decode token.
// For this MVP, let's keep it simple: Track by VisitorID. If req.user exists (global middleware? No).
// We will stick to visitor ID for simplicity as requested "visitor details".

router.post('/track', trackVisit);

// Admin routes
router.get('/logs', protect, admin, getAnalytics);
router.get('/stats', protect, admin, getStats);

module.exports = router;
