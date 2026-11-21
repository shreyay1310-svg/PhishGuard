const express = require('express');
const router = express.Router();
const threatsController = require('../controllers/threatsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/insights', authenticateToken, threatsController.getThreatInsights);

module.exports = router;
