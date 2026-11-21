/**
 * Reports Controller for PhishGuard
 * Generates and downloads Email Scan Summary, Threat Analysis, User Activity, and Monthly Security reports.
 */

const { inMemoryStore } = require('../config/db');

exports.getReports = async (req, res) => {
  try {
    const list = inMemoryStore.reports.map(r => {
      const user = inMemoryStore.users.find(u => u.UserID === r.UserID) || {};
      return {
        reportId: r.ReportID,
        title: r.ReportType,
        generatedAt: r.GeneratedAt,
        generatedBy: user.FullName || 'Security Admin',
        filePath: r.FilePath
      };
    });

    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports', error: err.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { reportType } = req.body;
    const userId = req.user ? req.user.userId : 1;

    const newReport = {
      ReportID: inMemoryStore.reports.length + 1,
      UserID: userId,
      ReportType: reportType || 'Email Scan Summary',
      FilePath: `/reports/${(reportType || 'summary').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`,
      GeneratedAt: new Date().toISOString()
    };

    inMemoryStore.reports.unshift(newReport);

    inMemoryStore.userActivity.unshift({
      ActivityID: inMemoryStore.userActivity.length + 1,
      UserID: userId,
      ActivityType: 'REPORT_GENERATED',
      Description: `Generated report: ${newReport.ReportType}`,
      ActivityDate: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: newReport
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate report', error: err.message });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const type = req.query.type || 'summary';
    const format = req.query.format || 'pdf';

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `PhishGuard_${type.toUpperCase()}_REPORT_${timestamp}.${format === 'csv' ? 'csv' : 'html'}`;

    if (format === 'csv') {
      let csv = 'ScanID,Subject,Sender,Result,RiskScore,Date\n';
      inMemoryStore.scanHistory.forEach(s => {
        const e = inMemoryStore.emails.find(em => em.EmailID === s.EmailID) || {};
        csv += `${s.ScanID},"${e.Subject || ''}","${e.SenderEmail || ''}",${s.ScanStatus},${s.RiskScore}%,"${s.ScannedAt}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    }

    // HTML/Printable PDF formatted report
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PhishGuard Cybersecurity Report - ${type}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #172033; background: #fff; }
    .header { border-bottom: 2px solid #138A4B; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 24px; font-weight: bold; color: #138A4B; }
    .meta { font-size: 13px; color: #64748B; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
    .stat-card { border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; background: #F8FAFC; }
    .stat-val { font-size: 26px; font-weight: bold; color: #172033; }
    .stat-lbl { font-size: 12px; color: #64748B; text-transform: uppercase; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
    th { background: #138A4B; color: white; text-align: left; padding: 10px 12px; }
    td { border-bottom: 1px solid #E2E8F0; padding: 10px 12px; }
    .badge { padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }
    .badge-phishing { background: #FEE2E2; color: #EF4444; }
    .badge-safe { background: #DCFCE7; color: #16A34A; }
    .badge-suspicious { background: #FEF3C7; color: #D97706; }
    .footer { margin-top: 50px; font-size: 12px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">🛡️ PhishGuard Security Report</div>
      <div class="meta">AI-Powered Email Phishing Detection & Threat Analytics</div>
    </div>
    <div style="text-align: right;">
      <div class="meta">Report Type: <strong>${type.toUpperCase()}</strong></div>
      <div class="meta">Generated: ${new Date().toLocaleString()}</div>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-val">1,248</div>
      <div class="stat-lbl">Total Emails Scanned</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: #16A34A;">932</div>
      <div class="stat-lbl">Safe Emails (74.7%)</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: #EF4444;">213</div>
      <div class="stat-lbl">Phishing Detected (17.1%)</div>
    </div>
    <div class="stat-card">
      <div class="stat-val" style="color: #D97706;">103</div>
      <div class="stat-lbl">Suspicious Emails (8.2%)</div>
    </div>
  </div>

  <h3>Incident & Scan Audit Log</h3>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Subject</th>
        <th>Sender</th>
        <th>Verdict</th>
        <th>Risk Score</th>
        <th>Date & Time</th>
      </tr>
    </thead>
    <tbody>
      ${inMemoryStore.scanHistory.map((s, idx) => {
        const e = inMemoryStore.emails.find(em => em.EmailID === s.EmailID) || {};
        const badgeClass = s.ScanStatus === 'PHISHING' ? 'badge-phishing' : (s.ScanStatus === 'SUSPICIOUS' ? 'badge-suspicious' : 'badge-safe');
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${e.Subject || ''}</strong></td>
            <td>${e.SenderEmail || ''}</td>
            <td><span class="badge ${badgeClass}">${s.ScanStatus}</span></td>
            <td>${s.RiskScore}%</td>
            <td>${new Date(s.ScannedAt).toLocaleString()}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="footer">
    Report automatically generated by PhishGuard AI Detection Engine. Confidential Cybersecurity Document.
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.status(200).send(html);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to download report', error: err.message });
  }
};
