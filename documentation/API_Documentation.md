# PhishGuard – REST API Documentation

PhishGuard provides high-throughput, secure REST APIs powering the frontend dashboard and external security integrations.

**Base URL**: `http://localhost:5000/api`  
**Authentication**: Bearer Token in `Authorization: Bearer <JWT>` header

---

## 1. Authentication Endpoints

### 1.1 `POST /auth/login`
Authenticates a user with email and password. Returns JWT token and user profile.
- **Request Body**:
```json
{
  "email": "admin@phishguard.cyber",
  "password": "YourPassword123"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": {
    "userId": 1,
    "fullName": "Shreya Yadav",
    "email": "admin@phishguard.cyber",
    "role": "Admin",
    "roleId": 2
  }
}
```

### 1.2 `POST /auth/register`
Registers a new user account.
- **Request Body**:
```json
{
  "fullName": "Analyst Name",
  "email": "analyst@phishguard.cyber",
  "password": "SecurePassword123",
  "roleId": 3
}
```

### 1.3 `GET /auth/profile`
Retrieves authenticated user details. (Protected)

---

## 2. Email Scanning Endpoints

### 2.1 `POST /scans/scan`
Submits email content or raw file to the AI/ML detection engine. Persists records to SQL Server `Emails`, `ScanHistory`, and `DetectionResults`.
- **Request Body** (JSON or FormData):
```json
{
  "sender": "support@paytm-secure.com",
  "recipient": "user@corporate.com",
  "subject": "Verify Your Account Now!",
  "body": "Dear User, Your account will be suspended in 24 hours. Please verify your account immediately by clicking the link below: https://paytm-account-verify.com/login",
  "rawContent": null,
  "attachmentName": null
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Email scanned successfully",
  "data": {
    "scanId": 6,
    "emailId": 6,
    "prediction": "PHISHING",
    "risk_score": 88.0,
    "risk_level": "High Risk",
    "model_confidence": 96.5,
    "sender_check": {
      "sender_email": "support@paytm-secure.com",
      "domain": "paytm-secure.com",
      "risk": "High",
      "spf_status": "FAIL",
      "reasons": ["Suspicious domain (paytm-secure.com)"]
    },
    "url_analysis": {
      "count": 1,
      "risk": "High",
      "malicious_detected": true,
      "urls": [
        {
          "url": "https://paytm-account-verify.com/login",
          "domain": "paytm-account-verify.com",
          "risk_level": "Malicious",
          "is_malicious": true
        }
      ]
    },
    "content_analysis": {
      "risk": "High",
      "keywords": ["verify account", "suspended", "immediately"],
      "urgency": true
    },
    "attachment_check": {
      "has_attachment": false,
      "risk": "Low",
      "reason": "No attachment"
    },
    "explanation": "Suspicious domain (paytm-secure.com). Malicious link detected with high-risk spoofing. Contains phishing keywords.",
    "recommendations": [
      "Do not click the link.",
      "Do not share your credentials.",
      "Mark the email as spam or phishing.",
      "Report to your IT/security team."
    ]
  }
}
```

### 2.2 `GET /scans/history`
Query and filter scan records.
- **Query Params**: `search`, `status` (`ALL`, `SAFE`, `SUSPICIOUS`, `PHISHING`), `page`, `limit`.

### 2.3 `GET /scans/:id`
Retrieves full detection report for a specific scan.

### 2.4 `DELETE /scans/:id`
Deletes a scan record.

### 2.5 `GET /scans/export-csv`
Downloads complete audit trail in CSV format.

---

## 3. Dashboard & Threat Insights

### 3.1 `GET /dashboard/stats`
Returns aggregated statistics matching SQL Server state:
- Total Scanned (e.g. 1,248)
- Safe Emails (e.g. 932, 74.7%)
- Phishing Detected (e.g. 213, 17.1%)
- Suspicious (e.g. 103, 8.2%)
- Email Scan Trend (timeseries Oct 25 - Nov 19)
- Threat Distribution Donut metrics
- Recent Scan Activity

### 3.2 `GET /threats/insights`
Returns threat intelligence metrics:
- Top Threat Types (Credential Phishing 42%, Banking Scam 24%, Fake Invoice 14%, etc.)
- Common Phishing Keywords
- Top Suspicious Domains
- Weekly Attack Trends
- Model Accuracy & Precision metrics

---

## 5. User Onboarding & Guided Tour Endpoints

### 5.1 `GET /onboarding/status`
Retrieves the logged-in user's onboarding progress from SQL Server.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "onboardingId": 1,
    "userId": 5,
    "isCompleted": false,
    "isSkipped": false,
    "currentStep": 1,
    "isNewUser": true,
    "startedAt": "2026-11-21T10:41:47.168Z",
    "completedAt": null
  }
}
```

### 5.2 `POST /onboarding/progress`
Updates current step, completed status, or skipped status.
- **Request Body**:
```json
{
  "currentStep": 3,
  "isCompleted": false,
  "isSkipped": false
}
```

### 5.3 `POST /onboarding/reset`
Resets onboarding progress to Step 1 (`isCompleted = false`, `isSkipped = false`) when the user selects **Replay Guided Tour** from Settings or Help.

---

## 6. Default Credentials

### 4.1 `GET /reports` & `POST /reports/generate`
List and trigger generation of compliance reports.

### 4.2 `GET /reports/download?type=<type>&format=<pdf|csv>`
Serves printable HTML/PDF or CSV security digests.

### 4.3 `GET /settings` & `PUT /settings`
Reads and updates security thresholds and notification settings.

### 4.4 `GET /users`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id`
Full user management with RBAC controls (Admin & Super Admin only).
