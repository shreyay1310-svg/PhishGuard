import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Request interceptor to automatically add JWT Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('phishguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle unauthorized redirects gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If expired token, clear and allow redirect
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('phishguard_token');
        localStorage.removeItem('phishguard_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const scanService = {
  scanEmail: (formData) => api.post('/scans/scan', formData, {
    headers: { 'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json' }
  }),
  getHistory: (params) => api.get('/scans/history', { params }),
  getScanById: (id) => api.get(`/scans/${id}`),
  deleteScan: (id) => api.delete(`/scans/${id}`),
  exportCSV: () => `${API_BASE_URL}/scans/export-csv`,
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const reportsService = {
  getReports: () => api.get('/reports'),
  generateReport: (data) => api.post('/reports/generate', data),
  getDownloadUrl: (type, format = 'pdf') => `${API_BASE_URL}/reports/download?type=${type}&format=${format}`,
};

export const threatsService = {
  getInsights: () => api.get('/threats/insights'),
};

export const usersService = {
  getUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

export const onboardingService = {
  getStatus: () => api.get('/onboarding/status'),
  saveProgress: (data) => api.post('/onboarding/progress', data),
  resetTour: () => api.post('/onboarding/reset'),
};

export default api;
