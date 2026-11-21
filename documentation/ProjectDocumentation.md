# PhishGuard – AI-Powered Email Phishing Detection System
## Complete System Documentation & Architecture Guide

---

## 1. System Overview

**PhishGuard** is an enterprise-grade cybersecurity web application built to analyze incoming email messages, headers, embedded links, and attachments in real time. Combining natural language processing (NLP), machine learning classifiers (TF-IDF + Logistic Regression / Random Forest), and threat intelligence heuristics, PhishGuard accurately identifies credential harvesting, banking fraud, invoice scams, and brand impersonation attacks.

The application features a modern light-themed user interface, an Express.js orchestration backend, Microsoft SQL Server database persistence managed via SSMS, and a dedicated Python FastAPI machine learning microservice.

---

## 2. Technology Stack & Component Architecture

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS (cybersecurity SaaS light theme)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (smooth area curves, donut breakdowns, and attack trends)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js v26
- **Web Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens) with 7-day expiration
- **Security**: Bcrypt password hashing, parameter validation, role-based authorization
- **Database Driver**: `mssql` package with connection pooling and stored procedure calls

### Database
- **Engine**: Microsoft SQL Server (Developer, Express, or Enterprise)
- **Administration**: SQL Server Management Studio (SSMS)
- **Database Name**: `PhishGuardDB`
- **Data Model**: 10 normalized tables with primary keys, foreign keys, cascades, indexes, and stored procedures

### AI/ML Microservice
- **Runtime**: Python 3.14
- **API Framework**: FastAPI & Uvicorn
- **Machine Learning**: Scikit-learn (TF-IDF Vectorizer, Logistic Regression, Naive Bayes, Random Forest)
- **NLP & Corpus**: NLTK, Stopwords, Punkt tokenizers
- **Data Analysis**: Pandas, NumPy
- **Persistence**: Joblib serialization

---

## 3. Threat Detection Methodology

PhishGuard combines machine learning probability with multi-factor cybersecurity heuristics across four specialized detection layers:

### A. NLP Content Analysis
- Evaluates urgent language ("immediately", "within 24 hours", "account suspended").
- Scans for credential harvesting requests ("login to verify", "enter password", "secret phrase").
- Flags financial triggers ("wire transfer", "unauthorized charge", "gift cards").
- Evaluates subject line capitalization ratios and exclamation mark density.

### B. URL Reputation & Typosquatting Analysis
- Extracts all embedded URLs using regex pattern matching.
- Detects IP address hosts (e.g. `http://192.168.1.100/login`).
- Identifies URL shortening redirection services (`bit.ly`, `tinyurl.com`, `ow.ly`).
- Evaluates high-risk, low-cost top-level domains (`.xyz`, `.top`, `.buzz`, `.cc`, `.vip`).
- Detects brand typosquatting impersonation (e.g., `paytm-secure.com`, `hdfc-update.com`, `amazon-verify.net`).

### C. Sender Domain Verification
- Compares display names against sender domains to detect executive and customer support spoofing.
- Flags free webmail domains (`gmail.com`, `yahoo.com`) claiming to represent banks or C-suite executives.
- Evaluates SPF and DKIM simulated alignment signals.

### D. Dangerous Attachment Inspection
- Flags dangerous executable and script extensions (`.exe`, `.scr`, `.vbs`, `.hta`, `.bat`, `.jar`, `.iso`).
- Flags macro-enabled document formats (`.docm`, `.xlsm`).

---

## 6. Interactive Guided Tour & Onboarding System

PhishGuard automatically launches an interactive, step-by-step product walkthrough whenever a newly registered user logs in for the first time:

1. **Welcome Screen Modal**:
   - Greets user by name with estimated duration (2–3 minutes).
   - "Start Guided Tour" and "Skip for Now" options.
2. **Step-by-Step Walkthrough**:
   - **Step 1: Dashboard Overview**: Metrics, trend lines, threat breakdown.
   - **Step 2: Scan Your First Email**: Paste editor, .eml/.msg file upload, discrete fields.
   - **Step 3: Understand Your AI Results**: Verdicts (Safe, Suspicious, Phishing), Risk Score (0-100), explainability.
   - **Step 4: Track Your Previous Scans**: Search, status filtering, date filters, CSV export.
   - **Step 5: Generate Security Reports**: Scan summary, threat analysis, user activity, monthly PDF/CSV reports.
   - **Step 6: Explore Threat Intelligence**: Phishing keywords, suspicious domains, attack trends.
   - **Step 7: Manage Your Account**: Profile, sensitivity settings, and system configuration.
3. **Role-Based Tailoring**:
   - Customized perspective notes and feature highlights for `Super Admin`, `Admin`, `Security Analyst`, and `Standard User`.
4. **SQL Server Persistence**:
   - Progress, skip status, and completion timestamps are stored in `dbo.UserOnboardingProgress`.
5. **Replay Guided Tour**:
   - Users can replay the tour at any time via the sidebar button or **Settings -> Replay Guided Tour**.

---

## 7. How to Run the Complete Application

### Step 1: Initialize Database in SSMS
1. Open **SQL Server Management Studio (SSMS)**.
2. Connect to your SQL Server instance (`localhost`, `localhost\SQLEXPRESS`, or `(localdb)\MSSQLLocalDB`).
3. Open `database/PhishGuardDB.sql` and click **Execute**.

### Step 2: Start the Python FastAPI ML Microservice
```powershell
cd ml-service
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Step 3: Start the Node.js Express Backend
```powershell
cd backend
node server.js
```

### Step 4: Start the React Frontend
```powershell
cd frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 5. Default Credentials

- **Admin Account**: `admin@phishguard.cyber` / `Admin@123`
- **Analyst Account**: `rahul.analyst@phishguard.cyber` / `Admin@123`
- **Super Admin**: `alex.super@phishguard.cyber` / `Admin@123`
