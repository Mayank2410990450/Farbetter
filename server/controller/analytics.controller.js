const Analytics = require('../models/Analytics.modal');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Track visitor page view
// @route   POST /api/analytics/track
// @access  Public
exports.trackVisit = asyncHandler(async (req, res) => {
    const { visitorId, page, deviceType } = req.body;
    const userAgent = req.headers['user-agent'];

    // Get IP (handles proxies like Nginx/Cloudflare)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const log = await Analytics.create({
        visitorId,
        user: req.user ? req.user.id : null, // If user is logged in (middleware might attach it)
        page,
        ip,
        userAgent,
        deviceType
    });

    res.status(201).json({ success: true });
});

// @desc    Get analytics logs (Admin)
// @route   GET /api/analytics/logs
// @access  Private/Admin
exports.getAnalytics = asyncHandler(async (req, res) => {
    // Simple pagination
    const pageSize = 50;
    const page = Number(req.query.pageNumber) || 1;

    const logs = await Analytics.find({})
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    const count = await Analytics.countDocuments({});

    res.json({
        success: true,
        logs,
        page,
        pages: Math.ceil(count / pageSize),
        totalLogs: count
    });
});

// @desc    Get dashboard stats
// @route   GET /api/analytics/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
    // Get counts for last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const totalVisits24h = await Analytics.countDocuments({ timestamp: { $gte: oneDayAgo } });

    const uniqueVisitors24h = await Analytics.distinct('visitorId', { timestamp: { $gte: oneDayAgo } });

    // Mobile vs Desktop
    const mobileCount = await Analytics.countDocuments({ deviceType: 'mobile', timestamp: { $gte: oneDayAgo } });
    const desktopCount = await Analytics.countDocuments({ deviceType: 'desktop', timestamp: { $gte: oneDayAgo } });

    res.json({
        success: true,
        totalVisits24h,
        uniqueVisitors24h: uniqueVisitors24h.length,
        deviceSplit: {
            mobile: mobileCount,
            desktop: desktopCount
        }
    });
});
