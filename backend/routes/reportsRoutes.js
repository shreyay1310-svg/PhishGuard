const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, reportsController.getReports);
router.post('/generate', authenticateToken, reportsController.generateReport);
router.get('/download', reportsController.downloadReport);

module.exports = router;
