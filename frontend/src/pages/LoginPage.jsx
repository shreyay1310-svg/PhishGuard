import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      if (res.data && res.data.token) {
        localStorage.setItem('phishguard_token', res.data.token);
        localStorage.setItem('phishguard_user', JSON.stringify(res.data.user));
        navigate('/app/dashboard');
      }
    } catch (err) {
      // Check if this is a demo account attempt when backend is offline or on Vercel preview
      const lowerEmail = email.toLowerCase().trim();
      const isDemoAccount =
        lowerEmail.includes('admin') ||
        lowerEmail.includes('analyst') ||
        lowerEmail.includes('sharma') ||
        lowerEmail.includes('demo');

      const isDemoPass =
        ['Admin@123', 'Analyst@123', 'User@123', 'Password@123'].includes(password) ||
        password.length >= 6;

      if (!err.response && isDemoAccount && isDemoPass) {
        // Backend service is offline or blocked by browser mixed-content; create instant demo session
        const isAnalyst = lowerEmail.includes('analyst') || lowerEmail.includes('rahul');
        const demoUser = {
          userId: isAnalyst ? 3 : 1,
          fullName: isAnalyst ? 'Rahul Sharma' : 'Shreya Yadav',
          email: lowerEmail,
          role: isAnalyst ? 'Security Analyst' : 'Admin',
          roleId: isAnalyst ? 3 : 2,
          isNewUser: false
        };
        const demoToken = 'phishguard_demo_jwt_' + btoa(JSON.stringify(demoUser)) + '_' + Date.now();
        localStorage.setItem('phishguard_token', demoToken);
        localStorage.setItem('phishguard_user', JSON.stringify(demoUser));
        navigate('/app/dashboard');
        return;
      }

      if (!err.response) {
        setError('Cannot reach backend on port 5050. Run "npm run backend" or click Admin/Analyst Demo below.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@phishguard.cyber');
      setPassword('Admin@123');
    } else if (role === 'analyst') {
      setEmail('rahul.analyst@phishguard.cyber');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF7EF] flex items-center justify-center text-[#138A4B] shadow-sm">
            <Shield className="w-7 h-7 fill-[#138A4B]/20" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#172033]">
            Phish<span className="text-[#138A4B]">Guard</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-[#172033]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Enter your cybersecurity operational portal credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl sm:px-10 border border-[#E2E8F0]">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#EF4444] flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@phishguard.cyber"
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#138A4B] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-[#138A4B] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#138A4B] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#172033]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#138A4B] hover:bg-[#22A06B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#138A4B] shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-[#F1F5F9]">
            <p className="text-xs font-medium text-[#64748B] text-center mb-3">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="py-2 px-3 text-xs font-medium rounded-lg bg-[#EAF7EF] text-[#138A4B] hover:bg-[#138A4B] hover:text-white transition-all text-center"
              >
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('analyst')}
                className="py-2 px-3 text-xs font-medium rounded-lg bg-[#F1F5F9] text-[#172033] hover:bg-[#64748B] hover:text-white transition-all text-center"
              >
                Analyst Demo
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#64748B]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#138A4B] hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
