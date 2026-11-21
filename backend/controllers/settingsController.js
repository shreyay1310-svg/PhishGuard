/**
 * System Settings Controller for PhishGuard
 */

const { inMemoryStore } = require('../config/db');

exports.getSettings = async (req, res) => {
  try {
    res.json({
      success: true,
      data: inMemoryStore.settings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const newSettings = req.body;
    inMemoryStore.settings = {
      ...inMemoryStore.settings,
      ...newSettings
    };

    inMemoryStore.userActivity.unshift({
      ActivityID: inMemoryStore.userActivity.length + 1,
      UserID: req.user ? req.user.userId : 1,
      ActivityType: 'SYSTEM_SETTINGS',
      Description: 'Updated security system thresholds and scan configuration',
      ActivityDate: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: inMemoryStore.settings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message });
  }
};
