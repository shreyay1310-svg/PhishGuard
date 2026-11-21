const express = require('express');
const router = express.Router();
const multer = require('multer');
const scanController = require('../controllers/scanController');
const { authenticateToken } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/scan', authenticateToken, upload.single('attachment'), scanController.scanEmail);
router.get('/history', authenticateToken, scanController.getScanHistory);
router.get('/export-csv', scanController.exportHistoryCSV);
router.get('/:id', authenticateToken, scanController.getScanById);
router.delete('/:id', authenticateToken, scanController.deleteScan);

module.exports = router;
