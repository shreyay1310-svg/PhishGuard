const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticateToken } = require('../middleware/auth');

router.get('/status', authenticateToken, onboardingController.getOnboardingStatus);
router.post('/progress', authenticateToken, onboardingController.saveOnboardingProgress);
router.post('/reset', authenticateToken, onboardingController.resetOnboarding);

module.exports = router;
