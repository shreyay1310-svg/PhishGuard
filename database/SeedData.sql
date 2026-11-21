-- =====================================================================
-- Database: PhishGuardDB
-- Script: SeedData.sql
-- Description: Inserts standard roles, default users, settings, and initial
--              realistic scan records for PhishGuard.
-- =====================================================================

USE PhishGuardDB;
GO

-- 1. Insert Roles
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'Super Admin')
BEGIN
    INSERT INTO dbo.Roles (RoleName, Description) VALUES
    ('Super Admin', 'Full system access and database administration privileges'),
    ('Admin', 'System management, user administration, and reporting privileges'),
    ('Security Analyst', 'Email threat scanning, incident investigation, and analytics review'),
    ('Standard User', 'Basic email scanning and personal history view');
END
GO

-- 2. Insert Users (Password: Admin@123 -> bcrypt hash $2a$10$wT8KzQk3tU1yA0pP5Fj9ReF2Jg8oY/1h8B4j.yqP6D2L9E8X1Z1sO)
-- Note: bcrypt hash for 'Admin@123' is $2a$10$lU7lW7WwHjX99s937VfXn.6w1Qk5tW4sM4c4b5h8l9j0o2p3q4r5s
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = 'admin@phishguard.cyber')
BEGIN
    DECLARE @AdminRoleID INT = (SELECT RoleID FROM dbo.Roles WHERE RoleName = 'Admin');
    DECLARE @SuperAdminRoleID INT = (SELECT RoleID FROM dbo.Roles WHERE RoleName = 'Super Admin');
    DECLARE @AnalystRoleID INT = (SELECT RoleID FROM dbo.Roles WHERE RoleName = 'Security Analyst');
    DECLARE @UserRoleID INT = (SELECT RoleID FROM dbo.Roles WHERE RoleName = 'Standard User');

    INSERT INTO dbo.Users (FullName, Email, PasswordHash, RoleID, IsActive, CreatedAt) VALUES
    ('Shreya Yadav', 'admin@phishguard.cyber', '$2b$10$2HhT6NqAeoZJiqZ9QnF4a.g5rV2n0jJ5vJv8kXb0q8aV5xH7/vJeu', @AdminRoleID, 1, SYSUTCDATETIME()),
    ('Alex Vance', 'alex.super@phishguard.cyber', '$2b$10$2HhT6NqAeoZJiqZ9QnF4a.g5rV2n0jJ5vJv8kXb0q8aV5xH7/vJeu', @SuperAdminRoleID, 1, SYSUTCDATETIME()),
    ('Rahul Sharma', 'rahul.analyst@phishguard.cyber', '$2b$10$2HhT6NqAeoZJiqZ9QnF4a.g5rV2n0jJ5vJv8kXb0q8aV5xH7/vJeu', @AnalystRoleID, 1, SYSUTCDATETIME()),
    ('Emma Watson', 'emma.user@phishguard.cyber', '$2b$10$2HhT6NqAeoZJiqZ9QnF4a.g5rV2n0jJ5vJv8kXb0q8aV5xH7/vJeu', @UserRoleID, 1, SYSUTCDATETIME());
END
GO

-- 3. Insert System Settings
IF NOT EXISTS (SELECT 1 FROM dbo.SystemSettings WHERE SettingName = 'SensitivityThreshold')
BEGIN
    INSERT INTO dbo.SystemSettings (SettingName, SettingValue) VALUES
    ('SensitivityThreshold', 'Medium'),
    ('AutoQuarantinePhishing', 'true'),
    ('URLDeepInspection', 'true'),
    ('SenderDMARCEnforcement', 'strict'),
    ('RetentionPeriodDays', '90'),
    ('AlertNotificationEmail', 'security-alerts@phishguard.cyber');
END
GO

-- 4. Insert Seed Emails and Scans
IF NOT EXISTS (SELECT 1 FROM dbo.Emails WHERE Subject = 'Verify Your Account Now!')
BEGIN
    DECLARE @ShreyaID INT = (SELECT UserID FROM dbo.Users WHERE Email = 'admin@phishguard.cyber');

    -- Scan 1: Paytm Phishing (from reference image)
    INSERT INTO dbo.Emails (UserID, SenderEmail, RecipientEmail, Subject, EmailBody, UploadedFileName, CreatedAt)
    VALUES (
        @ShreyaID, 
        'support@paytm-secure.com', 
        'user@corporate.com', 
        'Verify Your Account Now!',
        'Dear User, Your account will be suspended in 24 hours. Please verify your account immediately by clicking the link below: https://paytm-account-verify.com/login Regards, Paytm Support Team',
        NULL,
        DATEADD(HOUR, -5, SYSUTCDATETIME())
    );
    DECLARE @E1 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.ScanHistory (EmailID, UserID, ScanStatus, RiskScore, ScannedAt)
    VALUES (@E1, @ShreyaID, 'PHISHING', 92.00, DATEADD(HOUR, -5, SYSUTCDATETIME()));
    DECLARE @S1 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.DetectionResults (ScanID, Prediction, ModelConfidence, SenderRisk, URLRisk, ContentRisk, AttachmentRisk, Explanation, CreatedAt)
    VALUES (@S1, 'PHISHING', 96.50, 'High', 'High', 'High', 'Low', 'Suspicious domain (paytm-secure.com). Malicious link detected with credential phishing intent. Urgency keywords detected: "suspended", "verify account", "immediately".', DATEADD(HOUR, -5, SYSUTCDATETIME()));
    INSERT INTO dbo.SuspiciousURLs (ScanID, URL, Domain, RiskLevel, IsMalicious)
    VALUES (@S1, 'https://paytm-account-verify.com/login', 'paytm-account-verify.com', 'Malicious', 1);

    -- Scan 2: Amazon Invoice (Safe)
    INSERT INTO dbo.Emails (UserID, SenderEmail, RecipientEmail, Subject, EmailBody, UploadedFileName, CreatedAt)
    VALUES (
        @ShreyaID, 
        'no-reply@amazon.in', 
        'user@corporate.com', 
        'Your Invoice from Amazon',
        'Thank you for your order. Your invoice is attached. You can track your shipment through your Amazon account.',
        'invoice_98231.pdf',
        DATEADD(DAY, -1, SYSUTCDATETIME())
    );
    DECLARE @E2 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.ScanHistory (EmailID, UserID, ScanStatus, RiskScore, ScannedAt)
    VALUES (@E2, @ShreyaID, 'SAFE', 4.00, DATEADD(DAY, -1, SYSUTCDATETIME()));
    DECLARE @S2 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.DetectionResults (ScanID, Prediction, ModelConfidence, SenderRisk, URLRisk, ContentRisk, AttachmentRisk, Explanation, CreatedAt)
    VALUES (@S2, 'SAFE', 98.20, 'Low', 'Low', 'Low', 'Low', 'Legitimate authenticated domain (amazon.in). Valid SPF & DKIM signatures. Standard transactional notification content.', DATEADD(DAY, -1, SYSUTCDATETIME()));

    -- Scan 3: HDFC Bank Update (Suspicious)
    INSERT INTO dbo.Emails (UserID, SenderEmail, RecipientEmail, Subject, EmailBody, UploadedFileName, CreatedAt)
    VALUES (
        @ShreyaID, 
        'info@hdfc-update.com', 
        'user@corporate.com', 
        'Update Your Bank Details',
        'Dear Customer, KYC compliance requires immediate update of bank account details to prevent debit freezing.',
        NULL,
        DATEADD(DAY, -1, DATEADD(HOUR, -4, SYSUTCDATETIME()))
    );
    DECLARE @E3 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.ScanHistory (EmailID, UserID, ScanStatus, RiskScore, ScannedAt)
    VALUES (@E3, @ShreyaID, 'SUSPICIOUS', 56.00, DATEADD(DAY, -1, DATEADD(HOUR, -4, SYSUTCDATETIME())));
    DECLARE @S3 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.DetectionResults (ScanID, Prediction, ModelConfidence, SenderRisk, URLRisk, ContentRisk, AttachmentRisk, Explanation, CreatedAt)
    VALUES (@S3, 'SUSPICIOUS', 84.10, 'High', 'Medium', 'Medium', 'Low', 'Sender domain (hdfc-update.com) is not an official HDFC banking domain. Requests personal KYC info under regulatory pretext.', DATEADD(DAY, -1, DATEADD(HOUR, -4, SYSUTCDATETIME())));
    INSERT INTO dbo.SuspiciousURLs (ScanID, URL, Domain, RiskLevel, IsMalicious)
    VALUES (@S3, 'http://hdfc-update.com/kyc-portal', 'hdfc-update.com', 'Suspicious', 1);

    -- Scan 4: Flipkart Order (Safe)
    INSERT INTO dbo.Emails (UserID, SenderEmail, RecipientEmail, Subject, EmailBody, UploadedFileName, CreatedAt)
    VALUES (
        @ShreyaID, 
        'orders@flipkart.com', 
        'user@corporate.com', 
        'Order Confirmation',
        'Your Flipkart order #OD23847291 has been confirmed and packed for delivery.',
        NULL,
        DATEADD(DAY, -2, SYSUTCDATETIME())
    );
    DECLARE @E4 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.ScanHistory (EmailID, UserID, ScanStatus, RiskScore, ScannedAt)
    VALUES (@E4, @ShreyaID, 'SAFE', 2.00, DATEADD(DAY, -2, SYSUTCDATETIME()));
    DECLARE @S4 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.DetectionResults (ScanID, Prediction, ModelConfidence, SenderRisk, URLRisk, ContentRisk, AttachmentRisk, Explanation, CreatedAt)
    VALUES (@S4, 'SAFE', 99.10, 'Low', 'Low', 'Low', 'Low', 'Authenticated e-commerce sender flipkart.com. Normal shipment alert.', DATEADD(DAY, -2, SYSUTCDATETIME()));

    -- Scan 5: Security Alert (Safe)
    INSERT INTO dbo.Emails (UserID, SenderEmail, RecipientEmail, Subject, EmailBody, UploadedFileName, CreatedAt)
    VALUES (
        @ShreyaID, 
        'alert@yourbank.com', 
        'user@corporate.com', 
        'Security Alert',
        'A login was detected from Chrome on Windows. If this was you, no action is needed.',
        NULL,
        DATEADD(DAY, -3, SYSUTCDATETIME())
    );
    DECLARE @E5 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.ScanHistory (EmailID, UserID, ScanStatus, RiskScore, ScannedAt)
    VALUES (@E5, @ShreyaID, 'SAFE', 6.00, DATEADD(DAY, -3, SYSUTCDATETIME()));
    DECLARE @S5 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.DetectionResults (ScanID, Prediction, ModelConfidence, SenderRisk, URLRisk, ContentRisk, AttachmentRisk, Explanation, CreatedAt)
    VALUES (@S5, 'SAFE', 94.00, 'Low', 'Low', 'Low', 'Low', 'Standard internal security notification with verified SPF headers.', DATEADD(DAY, -3, SYSUTCDATETIME()));

    -- 5. Initial Onboarding for Admin
    IF NOT EXISTS (SELECT 1 FROM dbo.UserOnboardingProgress WHERE UserID = @ShreyaID)
    BEGIN
        INSERT INTO dbo.UserOnboardingProgress (UserID, IsCompleted, IsSkipped, CurrentStep, StartedAt, CompletedAt, LastUpdatedAt)
        VALUES (@ShreyaID, 1, 0, 7, DATEADD(DAY, -2, SYSUTCDATETIME()), DATEADD(DAY, -2, SYSUTCDATETIME()), DATEADD(DAY, -2, SYSUTCDATETIME()));
    END
END
GO
