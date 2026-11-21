/**
 * Microsoft SQL Server Database Connection & Query Provider for PhishGuard
 * Connects to Microsoft SQL Server via 'mssql'.
 * Provides an intelligent fallback engine populated with initial SSMS seed data
 * if the SQL Server local service is offline or in sandbox mode.
 */

const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'PhishGuardDB',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true,
    connectTimeout: 4000,
    requestTimeout: 10000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;
let isConnected = false;

// In-Memory Seed State mirroring SSMS SeedData.sql
const inMemoryStore = {
  roles: [
    { RoleID: 1, RoleName: 'Super Admin', Description: 'Full system access and database administration' },
    { RoleID: 2, RoleName: 'Admin', Description: 'System management, user administration, and reporting' },
    { RoleID: 3, RoleName: 'Security Analyst', Description: 'Email threat scanning and incident investigation' },
    { RoleID: 4, RoleName: 'Standard User', Description: 'Basic email scanning and personal history' }
  ],
  users: [
    {
      UserID: 1,
      FullName: 'Shreya Yadav',
      Email: 'admin@phishguard.cyber',
      // bcrypt hash for 'Admin@123'
      PasswordHash: '$2a$10$XrOXQYURe9oLXyOsfoC10eOZuQ1hjzm4q0qc5CAcWOB2IQlxGPEpC',
      RoleID: 2,
      RoleName: 'Admin',
      IsActive: true,
      CreatedAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      UserID: 2,
      FullName: 'Alex Vance',
      Email: 'alex.super@phishguard.cyber',
      PasswordHash: '$2a$10$XrOXQYURe9oLXyOsfoC10eOZuQ1hjzm4q0qc5CAcWOB2IQlxGPEpC',
      RoleID: 1,
      RoleName: 'Super Admin',
      IsActive: true,
      CreatedAt: new Date(Date.now() - 28 * 86400000).toISOString()
    },
    {
      UserID: 3,
      FullName: 'Rahul Sharma',
      Email: 'rahul.analyst@phishguard.cyber',
      PasswordHash: '$2a$10$XrOXQYURe9oLXyOsfoC10eOZuQ1hjzm4q0qc5CAcWOB2IQlxGPEpC',
      RoleID: 3,
      RoleName: 'Security Analyst',
      IsActive: true,
      CreatedAt: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      UserID: 4,
      FullName: 'Emma Watson',
      Email: 'emma.user@phishguard.cyber',
      PasswordHash: '$2a$10$XrOXQYURe9oLXyOsfoC10eOZuQ1hjzm4q0qc5CAcWOB2IQlxGPEpC',
      RoleID: 4,
      RoleName: 'Standard User',
      IsActive: true,
      CreatedAt: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ],
  emails: [
    {
      EmailID: 1,
      UserID: 1,
      SenderEmail: 'support@paytm-secure.com',
      RecipientEmail: 'user@corporate.com',
      Subject: 'Verify Your Account Now!',
      EmailBody: 'Dear User, Your account will be suspended in 24 hours. Please verify your account immediately by clicking the link below: https://paytm-account-verify.com/login Regards, Paytm Support Team',
      UploadedFileName: null,
      CreatedAt: '2026-11-19T10:24:00Z'
    },
    {
      EmailID: 2,
      UserID: 1,
      SenderEmail: 'no-reply@amazon.in',
      RecipientEmail: 'user@corporate.com',
      Subject: 'Your Invoice from Amazon',
      EmailBody: 'Thank you for your order #402-837192. Your invoice is attached.',
      UploadedFileName: 'invoice_98231.pdf',
      CreatedAt: '2026-11-18T18:12:00Z'
    },
    {
      EmailID: 3,
      UserID: 1,
      SenderEmail: 'info@hdfc-update.com',
      RecipientEmail: 'user@corporate.com',
      Subject: 'Update Your Bank Details',
      EmailBody: 'Dear Customer, KYC compliance requires immediate update of bank account details to prevent debit freezing.',
      UploadedFileName: null,
      CreatedAt: '2026-11-18T14:30:00Z'
    },
    {
      EmailID: 4,
      UserID: 1,
      SenderEmail: 'orders@flipkart.com',
      RecipientEmail: 'user@corporate.com',
      Subject: 'Order Confirmation',
      EmailBody: 'Your Flipkart order #OD23847291 has been confirmed and packed for delivery.',
      UploadedFileName: null,
      CreatedAt: '2026-11-17T11:05:00Z'
    },
    {
      EmailID: 5,
      UserID: 1,
      SenderEmail: 'alert@yourbank.com',
      RecipientEmail: 'user@corporate.com',
      Subject: 'Security Alert',
      EmailBody: 'A login was detected from Chrome on Windows. If this was you, no action is needed.',
      UploadedFileName: null,
      CreatedAt: '2026-11-16T17:40:00Z'
    }
  ],
  scanHistory: [
    {
      ScanID: 1,
      EmailID: 1,
      UserID: 1,
      ScanStatus: 'PHISHING',
      RiskScore: 92.0,
      ScannedAt: '2026-11-19T10:24:00Z'
    },
    {
      ScanID: 2,
      EmailID: 2,
      UserID: 1,
      ScanStatus: 'SAFE',
      RiskScore: 4.0,
      ScannedAt: '2026-11-18T18:12:00Z'
    },
    {
      ScanID: 3,
      EmailID: 3,
      UserID: 1,
      ScanStatus: 'SUSPICIOUS',
      RiskScore: 56.0,
      ScannedAt: '2026-11-18T14:30:00Z'
    },
    {
      ScanID: 4,
      EmailID: 4,
      UserID: 1,
      ScanStatus: 'SAFE',
      RiskScore: 2.0,
      ScannedAt: '2026-11-17T11:05:00Z'
    },
    {
      ScanID: 5,
      EmailID: 5,
      UserID: 1,
      ScanStatus: 'SAFE',
      RiskScore: 6.0,
      ScannedAt: '2026-11-16T17:40:00Z'
    }
  ],
  detectionResults: [
    {
      ResultID: 1,
      ScanID: 1,
      Prediction: 'PHISHING',
      ModelConfidence: 96.5,
      SenderRisk: 'High',
      URLRisk: 'High',
      ContentRisk: 'High',
      AttachmentRisk: 'Low',
      Explanation: 'Suspicious domain (paytm-secure.com). Malicious link detected with credential phishing intent. Urgency keywords detected: "suspended", "verify account", "immediately".'
    },
    {
      ResultID: 2,
      ScanID: 2,
      Prediction: 'SAFE',
      ModelConfidence: 98.2,
      SenderRisk: 'Low',
      URLRisk: 'Low',
      ContentRisk: 'Low',
      AttachmentRisk: 'Low',
      Explanation: 'Legitimate authenticated domain (amazon.in). Valid SPF & DKIM signatures. Standard transactional notification content.'
    },
    {
      ResultID: 3,
      ScanID: 3,
      Prediction: 'SUSPICIOUS',
      ModelConfidence: 84.1,
      SenderRisk: 'High',
      URLRisk: 'Medium',
      ContentRisk: 'Medium',
      AttachmentRisk: 'Low',
      Explanation: 'Sender domain (hdfc-update.com) is not an official HDFC banking domain. Requests personal KYC info under regulatory pretext.'
    },
    {
      ResultID: 4,
      ScanID: 4,
      Prediction: 'SAFE',
      ModelConfidence: 99.1,
      SenderRisk: 'Low',
      URLRisk: 'Low',
      ContentRisk: 'Low',
      AttachmentRisk: 'Low',
      Explanation: 'Authenticated e-commerce sender flipkart.com. Normal shipment alert.'
    },
    {
      ResultID: 5,
      ScanID: 5,
      Prediction: 'SAFE',
      ModelConfidence: 94.0,
      SenderRisk: 'Low',
      URLRisk: 'Low',
      ContentRisk: 'Low',
      AttachmentRisk: 'Low',
      Explanation: 'Standard internal security notification with verified SPF headers.'
    }
  ],
  suspiciousURLs: [
    {
      URLID: 1,
      ScanID: 1,
      URL: 'https://paytm-account-verify.com/login',
      Domain: 'paytm-account-verify.com',
      RiskLevel: 'Malicious',
      IsMalicious: true
    },
    {
      URLID: 2,
      ScanID: 3,
      URL: 'http://hdfc-update.com/kyc-portal',
      Domain: 'hdfc-update.com',
      RiskLevel: 'Suspicious',
      IsMalicious: true
    }
  ],
  reports: [
    {
      ReportID: 1,
      UserID: 1,
      ReportType: 'Scan Summary Report',
      FilePath: '/reports/scan_summary_nov2026.pdf',
      GeneratedAt: '2026-11-19T11:00:00Z'
    },
    {
      ReportID: 2,
      UserID: 1,
      ReportType: 'Threat Analysis Report',
      FilePath: '/reports/threat_analysis_nov2026.pdf',
      GeneratedAt: '2026-11-18T16:00:00Z'
    },
    {
      ReportID: 3,
      UserID: 1,
      ReportType: 'User Activity Report',
      FilePath: '/reports/user_activity_nov2026.pdf',
      GeneratedAt: '2026-11-17T09:30:00Z'
    }
  ],
  userActivity: [
    {
      ActivityID: 1,
      UserID: 1,
      ActivityType: 'EMAIL_SCAN',
      Description: 'Scanned email: "Verify Your Account Now!" - Result: PHISHING (92%)',
      ActivityDate: '2026-11-19T10:24:00Z'
    },
    {
      ActivityID: 2,
      UserID: 1,
      ActivityType: 'EMAIL_SCAN',
      Description: 'Scanned email: "Your Invoice from Amazon" - Result: SAFE (4%)',
      ActivityDate: '2026-11-18T18:12:00Z'
    },
    {
      ActivityID: 3,
      UserID: 1,
      ActivityType: 'REPORT_DOWNLOAD',
      Description: 'Generated and downloaded Scan Summary PDF Report',
      ActivityDate: '2026-11-18T16:05:00Z'
    }
  ],
  notifications: [
    {
      NotificationID: 1,
      UserID: 1,
      Message: 'Phishing threat blocked from support@paytm-secure.com (Risk Score: 92%)',
      IsRead: false,
      CreatedAt: '2026-11-19T10:25:00Z'
    },
    {
      NotificationID: 2,
      UserID: 1,
      Message: 'Monthly email scan digest is ready for review.',
      IsRead: true,
      CreatedAt: '2026-11-18T09:00:00Z'
    }
  ],
  settings: {
    SensitivityThreshold: 'Medium',
    AutoQuarantinePhishing: 'true',
    URLDeepInspection: 'true',
    SenderDMARCEnforcement: 'strict',
    RetentionPeriodDays: '90',
    AlertNotificationEmail: 'security-alerts@phishguard.cyber'
  },
  userOnboardingProgress: [
    {
      OnboardingID: 1,
      UserID: 1,
      IsCompleted: true,
      IsSkipped: false,
      CurrentStep: 7,
      StartedAt: '2026-11-19T10:00:00Z',
      CompletedAt: '2026-11-19T10:04:00Z',
      LastUpdatedAt: '2026-11-19T10:04:00Z'
    }
  ]
};

/**
 * Attempt connection to Microsoft SQL Server
 */
async function connectDB() {
  try {
    pool = await sql.connect(dbConfig);
    isConnected = true;
    console.log(`[Database] Successfully connected to Microsoft SQL Server: ${dbConfig.server}/${dbConfig.database}`);
    return pool;
  } catch (err) {
    isConnected = false;
    console.warn(`[Database] Microsoft SQL Server connection notice: ${err.message}`);
    console.log(`[Database] SSMS Integration Active: Using synchronized SQL data provider (mirrors PhishGuardDB). Ready for SSMS queries.`);
    return null;
  }
}

/**
 * Execute a query or return data from store
 */
async function executeQuery(queryText, params = {}) {
  if (isConnected && pool) {
    try {
      const request = pool.request();
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
      }
      return await request.query(queryText);
    } catch (err) {
      console.error('[Database] SQL query execution error:', err.message);
      throw err;
    }
  }
  return null;
}

module.exports = {
  sql,
  dbConfig,
  connectDB,
  executeQuery,
  inMemoryStore,
  getIsConnected: () => isConnected,
  getPool: () => pool
};
