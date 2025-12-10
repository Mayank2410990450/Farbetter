const express = require('express');
const router = express.Router();
const { testEmail } = require('../controller/debug.controller');

// Route: GET /api/debug/email?email=yourname@example.com
router.get('/email', testEmail);

module.exports = router;
