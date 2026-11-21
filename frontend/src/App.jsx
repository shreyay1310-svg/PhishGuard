import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ScanEmailPage from './pages/ScanEmailPage';
import ScanResultPage from './pages/ScanResultPage';
import ScanHistoryPage from './pages/ScanHistoryPage';
import ReportsPage from './pages/ReportsPage';
import ThreatInsightsPage from './pages/ThreatInsightsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('phishguard_token');
  if (!token) {
    // If not logged in, seed demo user automatically so experience is immediately testable
    localStorage.setItem('phishguard_token', 'demo_jwt_token_admin_2026');
    localStorage.setItem(
      'phishguard_user',
      JSON.stringify({
        userId: 1,
        fullName: 'Shreya Yadav',
        email: 'admin@phishguard.cyber',
        role: 'Admin',
        roleId: 2
      })
    );
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Authenticated Dashboard Suite */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="scan" element={<ScanEmailPage />} />
        <Route path="scan/result/:id" element={<ScanResultPage />} />
        <Route path="history" element={<ScanHistoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="threats" element={<ThreatInsightsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
