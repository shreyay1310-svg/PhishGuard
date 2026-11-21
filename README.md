# PhishGuard – AI-Powered Email Phishing Detection System

PhishGuard is an enterprise cybersecurity platform designed to inspect email content, sender credibility, embedded links, and attachments in real time. It utilizes machine learning and heuristic threat intelligence to identify phishing attacks, credential harvesting attempts, and brand impersonation.

---

## Architecture Overview

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend API**: Node.js, Express.js, JWT, bcryptjs, mssql
- **Database**: Microsoft SQL Server (`PhishGuardDB`) managed via SSMS
- **Machine Learning**: Python 3, FastAPI, Scikit-learn (TF-IDF + Logistic Regression / Random Forest), NLTK, Pandas

```
React (Vite) ──> Express Gateway ──> Microsoft SQL Server (SSMS)
                      │
                      └──> FastAPI (Python AI/ML Engine)
```

---

## Directory Structure

```
PhishGuard/
├── frontend/          # React.js + Vite UI application
├── backend/           # Node.js + Express REST API gateway
├── ml-service/        # Python FastAPI ML microservice & models
├── database/          # SQL Server scripts (PhishGuardDB.sql, StoredProcedures.sql)
├── documentation/     # Project, API, and Schema specifications
├── .gitignore
├── LICENSE
└── README.md
```

---

## Quickstart Guide

### 1. Database Setup (Microsoft SQL Server)
1. Open SQL Server Management Studio (SSMS).
2. Connect to your SQL Server instance (`localhost`, `SQLEXPRESS`, or `MSSQLLocalDB`).
3. Open `database/PhishGuardDB.sql` and run `Execute`.

### 2. Python ML Microservice
```bash
cd ml-service
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8008
```

### 3. Node.js Backend Gateway
```bash
cd backend
npm install
node server.js
```
The backend starts on port 5050.

### 4. React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Default Test Credentials

- **Admin**: `admin@phishguard.cyber` / `Admin@123`
- **Security Analyst**: `rahul.analyst@phishguard.cyber` / `Admin@123`

---

## Production Deployment

- **Frontend**: Deployed to Vercel with single-page app routing rewrites (`vercel.json`).
- **Backend**: Container or Node service on Render, Railway, or Azure App Service.
- **ML Engine**: Python container on Render, Railway, or Azure Container Apps.
- **Database**: Azure SQL Database or hosted Microsoft SQL Server instance.

---

## License

This project is licensed under the MIT License.
