# PhishGuard – Microsoft SQL Server Database Schema (PhishGuardDB)

This database is designed for enterprise deployment on **Microsoft SQL Server (Developer, Express, or Enterprise Edition)** and managed using **SQL Server Management Studio (SSMS)**.

## 1. Database Architecture & Relationships

```
+----------------+          +-------------------+          +----------------------+
|     Roles      | 1      * |       Users       | 1      * |        Emails        |
|----------------|----------|-------------------|----------|----------------------|
| RoleID (PK)    |          | UserID (PK)       |          | EmailID (PK)         |
| RoleName       |          | FullName          |          | UserID (FK)          |
| Description    |          | Email (UQ, IX)    |          | SenderEmail (IX)     |
| CreatedAt      |          | PasswordHash      |          | RecipientEmail       |
+----------------+          | RoleID (FK)       |          | Subject              |
                            | IsActive          |          | EmailBody            |
                            | CreatedAt         |          | UploadedFileName     |
                            +-------------------+          | CreatedAt (IX)       |
                                      |                    +----------------------+
                                      | 1                             | 1
                                      |                               |
                                      | *                             | *
                            +-------------------+          +----------------------+
                            |   UserActivity    |          |     ScanHistory      |
                            |-------------------|          |----------------------|
                            | ActivityID (PK)   |          | ScanID (PK)          |
                            | UserID (FK)       |          | EmailID (FK)         |
                            | ActivityType      |          | UserID (FK)          |
                            | Description       |          | ScanStatus (IX)      |
                            | ActivityDate (IX) |          | RiskScore            |
                            +-------------------+          | ScannedAt (IX)       |
                                                           +----------------------+
                                                                      | 1
                                                     +----------------+----------------+
                                                     | 1                               | *
                                          +---------------------+           +--------------------+
                                          |  DetectionResults   |           |   SuspiciousURLs   |
                                          |---------------------|           |--------------------|
                                          | ResultID (PK)       |           | URLID (PK)         |
                                          | ScanID (FK, UQ, IX) |           | ScanID (FK, IX)    |
                                          | Prediction          |           | URL                |
                                          | ModelConfidence     |           | Domain (IX)        |
                                          | SenderRisk          |           | RiskLevel          |
                                          | URLRisk             |           | IsMalicious        |
                                          | ContentRisk         |           | CreatedAt          |
                                          | AttachmentRisk      |           +--------------------+
                                          | Explanation         |
                                          | CreatedAt           |
                                          +---------------------+
```

## 2. Table Specifications

### 2.1. `Roles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `RoleID` | INT | IDENTITY(1,1), PK | Primary identifier |
| `RoleName` | NVARCHAR(50) | NOT NULL, UNIQUE | Super Admin, Admin, Security Analyst, Standard User |
| `Description` | NVARCHAR(255) | NULL | Detailed permission description |
| `CreatedAt` | DATETIME2 | DEFAULT SYSUTCDATETIME() | UTC record creation timestamp |

### 2.2. `Users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `UserID` | INT | IDENTITY(1,1), PK | Primary identifier |
| `FullName` | NVARCHAR(150) | NOT NULL | User's full name |
| `Email` | NVARCHAR(255) | NOT NULL, UNIQUE, INDEX | Unique login email |
| `PasswordHash` | NVARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `RoleID` | INT | NOT NULL, FK -> Roles | Foreign key relationship |
| `IsActive` | BIT | NOT NULL, DEFAULT 1 | Account activation status |
| `CreatedAt` | DATETIME2 | DEFAULT SYSUTCDATETIME() | UTC record creation timestamp |

### 2.3. `Emails`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `EmailID` | INT | IDENTITY(1,1), PK | Primary identifier |
| `UserID` | INT | NULL, FK -> Users | Operator who initiated scan |
| `SenderEmail` | NVARCHAR(255) | NOT NULL, INDEX | From header / sender address |
| `RecipientEmail` | NVARCHAR(255) | NULL | To header / recipient address |
| `Subject` | NVARCHAR(500) | NOT NULL | Email subject line |
| `EmailBody` | NVARCHAR(MAX) | NOT NULL | Parsed or raw email body |
| `UploadedFileName` | NVARCHAR(255) | NULL | Attachment / .eml / .msg filename |
| `CreatedAt` | DATETIME2 | DEFAULT SYSUTCDATETIME() | Ingestion timestamp |

### 2.4. `ScanHistory`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `ScanID` | INT | IDENTITY(1,1), PK | Primary scan identifier |
| `EmailID` | INT | NOT NULL, FK -> Emails | Foreign key relationship |
| `UserID` | INT | NULL, FK -> Users | Auditor / scanner ID |
| `ScanStatus` | NVARCHAR(50) | NOT NULL, INDEX | SAFE, SUSPICIOUS, PHISHING |
| `RiskScore` | DECIMAL(5,2) | NOT NULL | Calculated risk score (0.00 - 100.00) |
| `ScannedAt` | DATETIME2 | DEFAULT SYSUTCDATETIME() | Execution timestamp |

### 2.5. `DetectionResults`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `ResultID` | INT | IDENTITY(1,1), PK | Primary identifier |
| `ScanID` | INT | NOT NULL, UNIQUE, FK | One-to-one foreign key with ScanHistory |
| `Prediction` | NVARCHAR(50) | NOT NULL | Machine learning categorical verdict |
| `ModelConfidence` | DECIMAL(5,2) | NOT NULL | Statistical classifier confidence % |
| `SenderRisk` | NVARCHAR(50) | NOT NULL | Low / Medium / High |
| `URLRisk` | NVARCHAR(50) | NOT NULL | Low / Medium / High |
| `ContentRisk` | NVARCHAR(50) | NOT NULL | Low / Medium / High |
| `AttachmentRisk` | NVARCHAR(50) | NOT NULL | Low / Medium / High |
| `Explanation` | NVARCHAR(MAX) | NULL | Explainable AI rationale & detected indicators |
| `CreatedAt` | DATETIME2 | DEFAULT SYSUTCDATETIME() | Timestamp |

### 2.6. `SuspiciousURLs`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `URLID` | INT | IDENTITY(1,1), PK | Primary identifier |
| `ScanID` | INT | NOT NULL, FK -> ScanHistory | Associated scan |
| `URL` | NVARCHAR(2048) | NOT NULL | Full extracted URL |
| `Domain` | NVARCHAR(255) | NOT NULL, INDEX | Extracted netloc domain |
| `RiskLevel` | NVARCHAR(50) | NOT NULL | Safe, Suspicious, Malicious |
| `IsMalicious` | BIT | DEFAULT 0 | Binary malicious flag |
| `CreatedAt` | DATETIME2 | DEFAULT SYSUTCDATETIME() | Extraction timestamp |

### 2.7. `Reports`
Stores generated security audit summaries, threat digests, and user reports.

### 2.8. `UserActivity`
Audit trail recording user sign-ins, email scans, report generation, and role updates.

### 2.9. `Notifications`
System alert notifications for detected critical phishing attacks and system warnings.

### 2.10. `SystemSettings`
Configurable operational variables (SensitivityThreshold, AutoQuarantine, DMARC enforcement).

### 2.11. `UserOnboardingProgress`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `OnboardingID` | INT | IDENTITY(1,1), PK | Primary identifier |
| `UserID` | INT | NOT NULL, UNIQUE, FK -> Users | Associated user |
| `IsCompleted` | BIT | NOT NULL, DEFAULT 0 | 1 = user finished all 7 tour steps |
| `IsSkipped` | BIT | NOT NULL, DEFAULT 0 | 1 = user chose "Skip Tour" |
| `CurrentStep` | INT | NOT NULL, DEFAULT 1 | Current active step (1 to 7) |
| `StartedAt` | DATETIME2 | DEFAULT SYSUTCDATETIME() | Tour initial trigger timestamp |
| `CompletedAt` | DATETIME2 | NULL | Completion timestamp |
| `LastUpdatedAt` | DATETIME2 | DEFAULT SYSUTCDATETIME() | Last step advancement timestamp |

---

## 3. Execution in SQL Server Management Studio (SSMS)

To initialize or administer the database in SSMS:
1. Open **SQL Server Management Studio**.
2. Connect to your SQL Server instance (e.g., `localhost`, `localhost\SQLEXPRESS`, or `(localdb)\MSSQLLocalDB`).
3. Click **File -> Open -> File...** and select `database/PhishGuardDB.sql`.
4. Click **Execute** (or press **F5**).
5. Verify tables in Object Explorer under `Databases -> PhishGuardDB -> Tables`.
