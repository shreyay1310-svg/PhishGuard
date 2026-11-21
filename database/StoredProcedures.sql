-- =====================================================================
-- Database: PhishGuardDB
-- Script: StoredProcedures.sql
-- Description: Stored procedures for PhishGuard core workflows
-- =====================================================================

USE PhishGuardDB;
GO

-- 1. sp_AuthenticateUser
IF OBJECT_ID('dbo.sp_AuthenticateUser', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_AuthenticateUser;
GO
CREATE PROCEDURE dbo.sp_AuthenticateUser
    @Email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        u.UserID,
        u.FullName,
        u.Email,
        u.PasswordHash,
        u.RoleID,
        r.RoleName,
        u.IsActive,
        u.CreatedAt
    FROM dbo.Users u
    INNER JOIN dbo.Roles r ON u.RoleID = r.RoleID
    WHERE u.Email = @Email;
END
GO

-- 2. sp_SaveEmailScan
IF OBJECT_ID('dbo.sp_SaveEmailScan', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_SaveEmailScan;
GO
CREATE PROCEDURE dbo.sp_SaveEmailScan
    @UserID INT,
    @SenderEmail NVARCHAR(255),
    @RecipientEmail NVARCHAR(255),
    @Subject NVARCHAR(500),
    @EmailBody NVARCHAR(MAX),
    @UploadedFileName NVARCHAR(255),
    @ScanStatus NVARCHAR(50),
    @RiskScore DECIMAL(5,2),
    @Prediction NVARCHAR(50),
    @ModelConfidence DECIMAL(5,2),
    @SenderRisk NVARCHAR(50),
    @URLRisk NVARCHAR(50),
    @ContentRisk NVARCHAR(50),
    @AttachmentRisk NVARCHAR(50),
    @Explanation NVARCHAR(MAX),
    @NewScanID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Insert Email
        INSERT INTO dbo.Emails (UserID, SenderEmail, RecipientEmail, Subject, EmailBody, UploadedFileName, CreatedAt)
        VALUES (@UserID, @SenderEmail, @RecipientEmail, @Subject, @EmailBody, @UploadedFileName, SYSUTCDATETIME());

        DECLARE @EmailID INT = SCOPE_IDENTITY();

        -- Insert Scan History
        INSERT INTO dbo.ScanHistory (EmailID, UserID, ScanStatus, RiskScore, ScannedAt)
        VALUES (@EmailID, @UserID, @ScanStatus, @RiskScore, SYSUTCDATETIME());

        SET @NewScanID = SCOPE_IDENTITY();

        -- Insert Detection Results
        INSERT INTO dbo.DetectionResults (ScanID, Prediction, ModelConfidence, SenderRisk, URLRisk, ContentRisk, AttachmentRisk, Explanation, CreatedAt)
        VALUES (@NewScanID, @Prediction, @ModelConfidence, @SenderRisk, @URLRisk, @ContentRisk, @AttachmentRisk, @Explanation, SYSUTCDATETIME());

        -- Log Activity
        INSERT INTO dbo.UserActivity (UserID, ActivityType, Description, ActivityDate)
        VALUES (@UserID, 'EMAIL_SCAN', CONCAT('Scanned email: "', LEFT(@Subject, 50), '" - Result: ', @ScanStatus, ' (', @RiskScore, '%)'), SYSUTCDATETIME());

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- 3. sp_GetDashboardStats
IF OBJECT_ID('dbo.sp_GetDashboardStats', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetDashboardStats;
GO
CREATE PROCEDURE dbo.sp_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Summary counts
    SELECT 
        COUNT(*) AS TotalScanned,
        SUM(CASE WHEN ScanStatus = 'SAFE' THEN 1 ELSE 0 END) AS SafeEmails,
        SUM(CASE WHEN ScanStatus = 'PHISHING' THEN 1 ELSE 0 END) AS PhishingDetected,
        SUM(CASE WHEN ScanStatus = 'SUSPICIOUS' THEN 1 ELSE 0 END) AS SuspiciousEmails
    FROM dbo.ScanHistory;

    -- Recent scans (last 10)
    SELECT TOP 10
        sh.ScanID,
        e.Subject,
        e.SenderEmail,
        sh.ScanStatus,
        sh.RiskScore,
        sh.ScannedAt,
        u.FullName AS ScannedBy
    FROM dbo.ScanHistory sh
    INNER JOIN dbo.Emails e ON sh.EmailID = e.EmailID
    LEFT JOIN dbo.Users u ON sh.UserID = u.UserID
    ORDER BY sh.ScannedAt DESC;
END
GO

-- 4. sp_GetScanHistory
IF OBJECT_ID('dbo.sp_GetScanHistory', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetScanHistory;
GO
CREATE PROCEDURE dbo.sp_GetScanHistory
    @StatusFilter NVARCHAR(50) = NULL,
    @SearchKeyword NVARCHAR(255) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    SELECT 
        sh.ScanID,
        sh.EmailID,
        e.Subject,
        e.SenderEmail,
        e.RecipientEmail,
        sh.ScanStatus,
        sh.RiskScore,
        sh.ScannedAt,
        dr.ModelConfidence,
        dr.SenderRisk,
        dr.URLRisk,
        dr.ContentRisk,
        dr.AttachmentRisk,
        dr.Explanation,
        u.FullName AS ScannedBy
    FROM dbo.ScanHistory sh
    INNER JOIN dbo.Emails e ON sh.EmailID = e.EmailID
    INNER JOIN dbo.DetectionResults dr ON sh.ScanID = dr.ScanID
    LEFT JOIN dbo.Users u ON sh.UserID = u.UserID
    WHERE (@StatusFilter IS NULL OR @StatusFilter = 'ALL' OR sh.ScanStatus = @StatusFilter)
      AND (@SearchKeyword IS NULL OR e.Subject LIKE '%' + @SearchKeyword + '%' OR e.SenderEmail LIKE '%' + @SearchKeyword + '%')
    ORDER BY sh.ScannedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- 5. sp_GetUserOnboarding
IF OBJECT_ID('dbo.sp_GetUserOnboarding', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GetUserOnboarding;
GO
CREATE PROCEDURE dbo.sp_GetUserOnboarding
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        OnboardingID,
        UserID,
        IsCompleted,
        IsSkipped,
        CurrentStep,
        StartedAt,
        CompletedAt,
        LastUpdatedAt
    FROM dbo.UserOnboardingProgress
    WHERE UserID = @UserID;
END
GO

-- 6. sp_SaveUserOnboardingProgress
IF OBJECT_ID('dbo.sp_SaveUserOnboardingProgress', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_SaveUserOnboardingProgress;
GO
CREATE PROCEDURE dbo.sp_SaveUserOnboardingProgress
    @UserID INT,
    @CurrentStep INT,
    @IsCompleted BIT,
    @IsSkipped BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM dbo.UserOnboardingProgress WHERE UserID = @UserID)
    BEGIN
        UPDATE dbo.UserOnboardingProgress
        SET 
            CurrentStep = @CurrentStep,
            IsCompleted = @IsCompleted,
            IsSkipped = @IsSkipped,
            CompletedAt = CASE WHEN @IsCompleted = 1 THEN SYSUTCDATETIME() ELSE CompletedAt END,
            LastUpdatedAt = SYSUTCDATETIME()
        WHERE UserID = @UserID;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.UserOnboardingProgress (UserID, CurrentStep, IsCompleted, IsSkipped, StartedAt, CompletedAt, LastUpdatedAt)
        VALUES (
            @UserID,
            @CurrentStep,
            @IsCompleted,
            @IsSkipped,
            SYSUTCDATETIME(),
            CASE WHEN @IsCompleted = 1 THEN SYSUTCDATETIME() ELSE NULL END,
            SYSUTCDATETIME()
        );
    END
END
GO

-- 7. sp_ResetUserOnboarding
IF OBJECT_ID('dbo.sp_ResetUserOnboarding', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_ResetUserOnboarding;
GO
CREATE PROCEDURE dbo.sp_ResetUserOnboarding
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.UserOnboardingProgress
    SET 
        CurrentStep = 1,
        IsCompleted = 0,
        IsSkipped = 0,
        CompletedAt = NULL,
        LastUpdatedAt = SYSUTCDATETIME()
    WHERE UserID = @UserID;

    IF @@ROWCOUNT = 0
    BEGIN
        INSERT INTO dbo.UserOnboardingProgress (UserID, CurrentStep, IsCompleted, IsSkipped, StartedAt, LastUpdatedAt)
        VALUES (@UserID, 1, 0, 0, SYSUTCDATETIME(), SYSUTCDATETIME());
    END
END
GO
