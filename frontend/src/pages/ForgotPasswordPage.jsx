import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true); // Always display confirmation
    } finally {
      setLoading(false);
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
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Enter your registered email address to receive reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl sm:px-10 border border-[#E2E8F0]">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#172033]">Recovery link sent</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                If an account exists for <strong className="text-[#172033]">{email}</strong>, you will receive password reset instructions shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#138A4B] hover:underline pt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="name@company.com"
                    className="block w-full pl-10 pr-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#138A4B] focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#138A4B] hover:bg-[#22A06B] shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#172033]">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
