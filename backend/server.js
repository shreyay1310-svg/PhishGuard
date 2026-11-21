/**
 * PhishGuard Express Backend Server
 * Connects to Microsoft SQL Server, communicates with Python FastAPI ML service,
 * and serves the React frontend API.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const threatsRoutes = require('./routes/threatsRoutes');
const usersRoutes = require('./routes/usersRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'PhishGuard Cybersecurity Backend',
    database: 'Microsoft SQL Server (PhishGuardDB)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/threats', threatsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/onboarding', onboardingRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Backend Server Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server and Connect DB
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🛡️  PhishGuard Backend running on http://localhost:${PORT}`);
  console.log(`📡 Ready for React Frontend API requests`);
  console.log(`=======================================================`);
  await connectDB();
});
