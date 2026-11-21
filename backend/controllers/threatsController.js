/**
 * Threat Insights Controller for PhishGuard
 * Provides cybersecurity telemetry and attack trend analytics.
 */

exports.getThreatInsights = async (req, res) => {
  try {
    // Exact threat breakdown matching the reference image
    const threatTypes = [
      { type: 'Credential Phishing', percentage: 42, count: 524, color: '#EF4444' },
      { type: 'Banking Scam', percentage: 24, count: 299, color: '#F59E0B' },
      { type: 'Fake Invoice', percentage: 14, count: 175, color: '#6366F1' },
      { type: 'Account Suspensions', percentage: 12, count: 150, color: '#EC4899' },
      { type: 'Other', percentage: 8, count: 100, color: '#64748B' }
    ];

    // Common phishing keywords matching reference image
    const commonKeywords = [
      { keyword: 'verify account', frequency: 184, threatLevel: 'Critical' },
      { keyword: 'update details', frequency: 142, threatLevel: 'High' },
      { keyword: 'account suspended', frequency: 129, threatLevel: 'Critical' },
      { keyword: 'click here', frequency: 198, threatLevel: 'Medium' },
      { keyword: 'confirm identity', frequency: 115, threatLevel: 'High' },
      { keyword: 'urgent action', frequency: 98, threatLevel: 'High' },
      { keyword: 'login now', frequency: 164, threatLevel: 'Critical' }
    ];

    // Top suspicious domains matching reference image
    const suspiciousDomains = [
      { domain: 'paytm-secure.com', riskLevel: 'Malicious', blockedCount: 42, category: 'Impersonation' },
      { domain: 'hdfc-update.com', riskLevel: 'Malicious', blockedCount: 28, category: 'Banking Phishing' },
      { domain: 'amazon-verify.net', riskLevel: 'Malicious', blockedCount: 35, category: 'Credential Harvesting' },
      { domain: 'office365-security-portal.xyz', riskLevel: 'Suspicious', blockedCount: 19, category: 'Business Email' },
      { domain: 'paypal-resolution-center.biz', riskLevel: 'Malicious', blockedCount: 22, category: 'Financial Fraud' }
    ];

    // Weekly attack vectors trend
    const weeklyAttackTrends = [
      { day: 'Mon', credential: 28, banking: 14, invoice: 8 },
      { day: 'Tue', credential: 34, banking: 18, invoice: 10 },
      { day: 'Wed', credential: 42, banking: 22, invoice: 12 },
      { day: 'Thu', credential: 31, banking: 16, invoice: 9 },
      { day: 'Fri', credential: 39, banking: 24, invoice: 15 },
      { day: 'Sat', credential: 12, banking: 6, invoice: 4 },
      { day: 'Sun', credential: 15, banking: 8, invoice: 5 }
    ];

    // AI/ML Model Detection Accuracy Metrics
    const modelMetrics = {
      modelName: 'Logistic Regression + Random Forest Ensemble',
      accuracy: 98.4,
      precision: 97.9,
      recall: 98.8,
      f1Score: 98.3,
      totalTrainedSamples: 4000,
      falsePositiveRate: 1.2
    };

    res.json({
      success: true,
      data: {
        threatTypes,
        commonKeywords,
        suspiciousDomains,
        weeklyAttackTrends,
        modelMetrics
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve threat insights', error: err.message });
  }
};
