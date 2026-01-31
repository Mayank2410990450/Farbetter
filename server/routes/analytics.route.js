const express = require('express');
const router = express.Router();
const { trackVisit, getAnalytics, getStats } = require('../controller/analytics.controller');
const protect = require('../middlewares/auth.middleware');
const allowRoles = require('../middlewares/roles.middleware');
const optionalAuth = require('../middlewares/optionalAuth.middleware');

// Public route to track visits (with optional user tracking)
router.post('/track', optionalAuth, trackVisit);

// Admin routes
router.get('/logs', protect, allowRoles('admin'), getAnalytics);
router.get('/stats', protect, allowRoles('admin'), getStats);

module.exports = router;
