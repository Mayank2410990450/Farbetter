const express = require('express');
const router = express.Router();
const { trackVisit, getAnalytics, getStats } = require('../controller/analytics.controller');
const protect = require('../middlewares/auth.middleware');
const allowRoles = require('../middlewares/roles.middleware');

// Public route to track visits
router.post('/track', trackVisit);

// Admin routes
router.get('/logs', protect, allowRoles('admin'), getAnalytics);
router.get('/stats', protect, allowRoles('admin'), getStats);

module.exports = router;
