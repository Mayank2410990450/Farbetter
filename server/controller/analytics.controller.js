const Analytics = require('../models/Analytics.modal');
const asyncHandler = require('../middlewares/asyncHandler');

const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

// @desc    Track visitor page view
// @route   POST /api/analytics/track
// @access  Public
exports.trackVisit = asyncHandler(async (req, res) => {
    const { visitorId, page } = req.body;
    const userAgent = req.headers['user-agent'];
    const uaParser = new UAParser(userAgent);
    const result = uaParser.getResult();

    // Get IP (handles proxies like Nginx/Cloudflare)
    // Localhost IP often returns ::1, so we handle that case
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();

    // Get Location
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : 'Unknown';
    const city = geo ? geo.city : 'Unknown';

    const log = await Analytics.create({
        visitorId,
        user: req.user ? req.user.id : null,
        page,
        ip,
        userAgent,
        deviceType: result.device.type || 'desktop', // ua-parser often returns undefined for desktop
        browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
        os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
        country,
        city
    });

    // Populate user info before emitting
    const populatedLog = await log.populate('user', 'name email');

    // Emit live event
    const io = req.app.get('io');
    if (io) {
        io.emit('new-visit', populatedLog);
    }

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
