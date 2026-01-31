const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    visitorId: {
        type: String,
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    page: {
        type: String,
        required: true
    },
    ip: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    deviceType: {
        type: String,
        enum: ['mobile', 'desktop', 'tablet', 'unknown'],
        default: 'unknown'
    },
    browser: String,
    os: String,
    country: String,
    city: String,
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 604800 // Auto-delete logs after 7 days to save space
    }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
