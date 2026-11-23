# PhishGuard – AI-Powered Email Phishing Detection System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-138A4B?style=for-the-badge&logo=vercel&logoColor=white)](https://phishguard-beta-fawn.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shreyay1310-svg/PhishGuard)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> 🌐 **Live Production App**: **[https://phishguard-beta-fawn.vercel.app](https://phishguard-beta-fawn.vercel.app)**  
> 🛡️ **Instant 1-Click Demo**: Click **"Admin Demo"** or **"Analyst Demo"** on the [Login Page](https://phishguard-beta-fawn.vercel.app/login) to explore the full dashboard, scanner, and threat insights immediately.

---

PhishGuard is an enterprise cybersecurity platform designed to inspect email content, sender credibility, embedded links, and attachments in real time. It utilizes machine learning and heuristic threat intelligence to identify phishing attacks, credential harvesting attempts, and brand impersonation.

---

## 🚀 Live Demo & Deployment

| Component | Platform | Status | Production URL |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | **Live** | **[https://phishguard-beta-fawn.vercel.app](https://phishguard-beta-fawn.vercel.app)** |
| **Backend REST API** | **Vercel** | **Active** | **[https://backend-phishguard.vercel.app](https://backend-phishguard.vercel.app)** |
| **Python ML Engine** | **Vercel** | **Active** | **[https://phish-guard-blush.vercel.app](https://phish-guard-blush.vercel.app)** |
| **Source Code** | **GitHub** | **Active** | **[https://github.com/shreyay1310-svg/PhishGuard](https://github.com/shreyay1310-svg/PhishGuard)** |

---

## 🛠️ Architecture Overview

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend API**: Node.js, Express.js, JWT, bcryptjs, mssql
- **Database**: Microsoft SQL Server (`PhishGuardDB`) managed via SSMS
- **Machine Learning**: Python 3, FastAPI, Scikit-learn (TF-IDF + Logistic Regression / Random Forest), NLTK, Pandas

```text
React (Vite) ──> Express Gateway (Port 5050) ──> Microsoft SQL Server (SSMS)
                      │
                      └──> FastAPI (Python AI/ML Engine Port 8008)
```

---

## 📁 Directory Structure

```text
PhishGuard/
├── frontend/          # React.js + Vite UI application (Vercel ready)
├── backend/           # Node.js + Express REST API gateway
├── ml-service/        # Python FastAPI ML microservice & models
├── database/          # SQL Server scripts (PhishGuardDB.sql, StoredProcedures.sql)
├── documentation/     # Project, API, and Schema specifications
├── .gitignore
├── LICENSE
├── package.json       # Root convenience scripts
└── README.md
```

---

## ⚡ Quickstart Guide

### Option 1: Run via Root Convenience Scripts (Recommended)

From the project root:

```bash
# 1. Start the React Frontend (Vite on http://localhost:3000)
npm run dev

# 2. In a second terminal, start the Express Backend (Port 5050)
npm run backend

# 3. In a third terminal, start the Python ML Service (Port 8008)
npm run start:ml
```

---

### Option 2: Step-by-Step Manual Setup

#### 1. Database Setup (Microsoft SQL Server)
1. Open SQL Server Management Studio (SSMS).
2. Connect to your SQL Server instance (`localhost`, `SQLEXPRESS`, or `MSSQLLocalDB`).
3. Open `database/PhishGuardDB.sql` and click **Execute**.

#### 2. Python ML Microservice
```bash
cd ml-service
python -m pip install -r requirements.txt
python app.py
```
ML service starts on `http://127.0.0.1:8008`.

#### 3. Node.js Backend Gateway
```bash
cd backend
npm install
node server.js
```
The backend starts on `http://localhost:5050`.

#### 4. React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🔑 Default Test Credentials

| Role | Email Address | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@phishguard.cyber` | `Admin@123` | Full administrative control, system settings, user management |
| **Security Analyst** | `rahul.analyst@phishguard.cyber` | `Admin@123` | Threat scanning, scan history, threat intelligence reports |
| **Standard User** | `emma.user@phishguard.cyber` | `Admin@123` | Individual email scans and personal scan history |

*Tip: On the [Login Page](https://phishguard-beta-fawn.vercel.app/login), you can click **"Admin Demo"** or **"Analyst Demo"** for instant 1-click login.*

---

## ☁️ Production Deployment

- **Frontend**: Deployed to Vercel at `https://phishguard-beta-fawn.vercel.app` with single-page app routing rewrites (`vercel.json`).
- **Backend**: Deployed to Vercel at `https://backend-phishguard.vercel.app`.
- **ML Engine**: Deployed to Vercel at `https://phish-guard-blush.vercel.app`.
- **Database**: Azure SQL Database or self-hosted Microsoft SQL Server instance.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
