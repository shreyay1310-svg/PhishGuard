-- =====================================================================
-- PHISHGUARD CYBERSECURITY DATABASE MASTER SETUP SCRIPT
-- Database: PhishGuardDB
-- Target: Microsoft SQL Server (SSMS / Developer / Express / LocalDB)
-- Description: Creates PhishGuardDB, Tables, Stored Procedures, and Seed Data.
-- =====================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'PhishGuardDB')
BEGIN
    CREATE DATABASE PhishGuardDB;
    PRINT 'Database PhishGuardDB created successfully.';
END
ELSE
BEGIN
    PRINT 'Database PhishGuardDB already exists.';
END
GO

USE PhishGuardDB;
GO

-- 1. Roles
IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles (
        RoleID INT IDENTITY(1,1) PRIMARY KEY,
        RoleName NVARCHAR(50) NOT NULL UNIQUE,
        Description NVARCHAR(255) NULL,
        CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END
GO

-- 2. Users
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        UserID INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(150) NOT NULL,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        RoleID INT NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID) ON DELETE NO ACTION
    );
    CREATE NONCLUSTERED INDEX IX_Users_Email ON dbo.Users(Email);
    CREATE NONCLUSTERED INDEX IX_Users_RoleID ON dbo.Users(RoleID);
END
GO

-- 3. Emails
IF OBJECT_ID('dbo.Emails', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Emails (
        EmailID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NULL,
        SenderEmail NVARCHAR(255) NOT NULL,
        RecipientEmail NVARCHAR(255) NULL,
        Subject NVARCHAR(500) NOT NULL,
        EmailBody NVARCHAR(MAX) NOT NULL,
        UploadedFileName NVARCHAR(255) NULL,
        CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Emails_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE SET NULL
    );
    CREATE NONCLUSTERED INDEX IX_Emails_SenderEmail ON dbo.Emails(SenderEmail);
    CREATE NONCLUSTERED INDEX IX_Emails_UserID ON dbo.Emails(UserID);
    CREATE NONCLUSTERED INDEX IX_Emails_CreatedAt ON dbo.Emails(CreatedAt);
END
GO

-- 4. ScanHistory
IF OBJECT_ID('dbo.ScanHistory', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ScanHistory (
        ScanID INT IDENTITY(1,1) PRIMARY KEY,
        EmailID INT NOT NULL,
        UserID INT NULL,
        ScanStatus NVARCHAR(50) NOT NULL,
        RiskScore DECIMAL(5,2) NOT NULL,
        ScannedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ScanHistory_Emails FOREIGN KEY (EmailID) REFERENCES dbo.Emails(EmailID) ON DELETE CASCADE,
        CONSTRAINT FK_ScanHistory_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE SET NULL
    );
    CREATE NONCLUSTERED INDEX IX_ScanHistory_ScanStatus ON dbo.ScanHistory(ScanStatus);
    CREATE NONCLUSTERED INDEX IX_ScanHistory_ScannedAt ON dbo.ScanHistory(ScannedAt);
    CREATE NONCLUSTERED INDEX IX_ScanHistory_UserID ON dbo.ScanHistory(UserID);
END
GO

-- 5. DetectionResults
IF OBJECT_ID('dbo.DetectionResults', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DetectionResults (
        ResultID INT IDENTITY(1,1) PRIMARY KEY,
        ScanID INT NOT NULL UNIQUE,
        Prediction NVARCHAR(50) NOT NULL,
        ModelConfidence DECIMAL(5,2) NOT NULL,
        SenderRisk NVARCHAR(50) NOT NULL,
        URLRisk NVARCHAR(50) NOT NULL,
        ContentRisk NVARCHAR(50) NOT NULL,
        AttachmentRisk NVARCHAR(50) NOT NULL,
        Explanation NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_DetectionResults_ScanHistory FOREIGN KEY (ScanID) REFERENCES dbo.ScanHistory(ScanID) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_DetectionResults_ScanID ON dbo.DetectionResults(ScanID);
END
GO

-- 6. SuspiciousURLs
IF OBJECT_ID('dbo.SuspiciousURLs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SuspiciousURLs (
        URLID INT IDENTITY(1,1) PRIMARY KEY,
        ScanID INT NOT NULL,
        URL NVARCHAR(2048) NOT NULL,
        Domain NVARCHAR(255) NOT NULL,
        RiskLevel NVARCHAR(50) NOT NULL,
        IsMalicious BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_SuspiciousURLs_ScanHistory FOREIGN KEY (ScanID) REFERENCES dbo.ScanHistory(ScanID) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_SuspiciousURLs_ScanID ON dbo.SuspiciousURLs(ScanID);
    CREATE NONCLUSTERED INDEX IX_SuspiciousURLs_Domain ON dbo.SuspiciousURLs(Domain);
END
GO

-- 7. Reports
IF OBJECT_ID('dbo.Reports', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reports (
        ReportID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NULL,
        ReportType NVARCHAR(100) NOT NULL,
        FilePath NVARCHAR(500) NULL,
        GeneratedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Reports_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE SET NULL
    );
END
GO

-- 8. UserActivity
IF OBJECT_ID('dbo.UserActivity', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserActivity (
        ActivityID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NULL,
        ActivityType NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NOT NULL,
        ActivityDate DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_UserActivity_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE SET NULL
    );
END
GO

-- 9. Notifications
IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        NotificationID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL,
        Message NVARCHAR(1000) NOT NULL,
        IsRead BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
    );
END
GO

-- 10. SystemSettings
IF OBJECT_ID('dbo.SystemSettings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SystemSettings (
        SettingID INT IDENTITY(1,1) PRIMARY KEY,
        SettingName NVARCHAR(100) NOT NULL UNIQUE,
        SettingValue NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END
GO

-- 11. UserOnboardingProgress
IF OBJECT_ID('dbo.UserOnboardingProgress', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserOnboardingProgress (
        OnboardingID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL UNIQUE,
        IsCompleted BIT NOT NULL DEFAULT 0,
        IsSkipped BIT NOT NULL DEFAULT 0,
        CurrentStep INT NOT NULL DEFAULT 1,
        StartedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        CompletedAt DATETIME2 NULL,
        LastUpdatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_UserOnboardingProgress_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_UserOnboardingProgress_UserID ON dbo.UserOnboardingProgress(UserID);
END
GO

PRINT 'PhishGuardDB database setup and tables initialized successfully.';
GO
