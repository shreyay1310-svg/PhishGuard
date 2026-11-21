import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Bell,
  Shield,
  Sliders,
  Palette,
  LogOut,
  Save,
  CheckCircle2,
  Database
} from 'lucide-react';
import { authService, settingsService } from '../services/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('phishguard_user') || 'null') || {
      fullName: 'Shreya Yadav',
      email: 'admin@phishguard.cyber',
      role: 'Admin'
    }
  );

  // Profile Form
  const [fullName, setFullName] = useState(user.fullName || '');
  const [email, setEmail] = useState(user.email || '');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Security & System Settings
  const [settings, setSettings] = useState({
    SensitivityThreshold: 'Medium',
    AutoQuarantinePhishing: 'true',
    URLDeepInspection: 'true',
    SenderDMARCEnforcement: 'strict',
    RetentionPeriodDays: '90',
    AlertNotificationEmail: 'security-alerts@phishguard.cyber'
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      if (res.data && res.data.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');
    try {
      const res = await authService.updateProfile({ fullName, email });
      if (res.data && res.data.user) {
        const updated = { ...user, ...res.data.user };
        setUser(updated);
        localStorage.setItem('phishguard_user', JSON.stringify(updated));
        setStatusMsg('Profile updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setSaving(true);
    setStatusMsg('');
    try {
      await authService.updatePassword({ currentPassword, newPassword });
      setStatusMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    setStatusMsg('');
    try {
      await settingsService.updateSettings(settings);
      setStatusMsg('System settings successfully synchronized with SQL Server!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('phishguard_token');
    localStorage.removeItem('phishguard_user');
    navigate('/login');
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'security', label: 'Security & Detection', icon: Shield },
    { id: 'system', label: 'Database & System', icon: Database },
    { id: 'theme', label: 'Theme Settings', icon: Palette }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">Settings</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Manage your profile, scanning sensitivity, notifications, and SQL Server connectivity
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-[#16A34A] flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Settings Navigation Menu */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setStatusMsg(''); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-left transition-all ${
                  isActive
                    ? 'bg-[#138A4B] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-[#F1F5F9] mt-3 space-y-1">
            <button
              onClick={() => {
                if (window.__replayPhishGuardTour) {
                  window.__replayPhishGuardTour();
                }
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-left text-[#138A4B] hover:bg-[#EAF7EF] transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Replay Guided Tour</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-left text-[#EF4444] hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Settings Content Pane */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-5">
              <h3 className="text-base font-bold text-[#172033] border-b border-[#F1F5F9] pb-3">
                Profile Details
              </h3>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#138A4B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#138A4B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Assigned Role</label>
                <input
                  type="text"
                  disabled
                  value={user.role || 'Admin'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F1F5F9] text-[#64748B] cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#138A4B] hover:bg-[#22A06B] text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          )}

          {/* PASSWORD TAB */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSave} className="space-y-5">
              <h3 className="text-base font-bold text-[#172033] border-b border-[#F1F5F9] pb-3">
                Update Password
              </h3>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#138A4B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#138A4B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#138A4B]"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#138A4B] hover:bg-[#22A06B] text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating...' : 'Change Password'}</span>
              </button>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[#172033] border-b border-[#F1F5F9] pb-3">
                Detection Sensitivity & Security Policies
              </h3>
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  AI Risk Threshold Sensitivity
                </label>
                <select
                  value={settings.SensitivityThreshold}
                  onChange={(e) => setSettings({ ...settings, SensitivityThreshold: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#138A4B]"
                >
                  <option value="Low">Low (Fewer False Positives, Risk &gt; 75)</option>
                  <option value="Medium">Medium (Balanced Enterprise Protection, Risk &gt; 60)</option>
                  <option value="High">High (Strict Zero-Tolerance, Risk &gt; 45)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Sender DMARC & SPF Enforcement
                </label>
                <select
                  value={settings.SenderDMARCEnforcement}
                  onChange={(e) => setSettings({ ...settings, SenderDMARCEnforcement: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#138A4B]"
                >
                  <option value="strict">Strict (Quarantine on SPF/DMARC mismatch)</option>
                  <option value="flexible">Flexible (Flag with warning score)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Security Alerts Dispatch Email
                </label>
                <input
                  type="email"
                  value={settings.AlertNotificationEmail}
                  onChange={(e) => setSettings({ ...settings, AlertNotificationEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#138A4B]"
                />
              </div>

              <button
                type="button"
                onClick={handleSettingsSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#138A4B] hover:bg-[#22A06B] text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Apply Security Rules'}</span>
              </button>
            </div>
          )}

          {/* SYSTEM TAB */}
          {activeTab === 'system' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[#172033] border-b border-[#F1F5F9] pb-3">
                Microsoft SQL Server & System Configuration
              </h3>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#64748B]">Database Name:</span>
                  <span className="font-mono font-bold text-[#172033]">PhishGuardDB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#64748B]">Management Tool:</span>
                  <span className="font-medium text-[#138A4B]">SQL Server Management Studio (SSMS)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#64748B]">Target Edition:</span>
                  <span className="font-medium text-[#172033]">Developer / Express / Enterprise / LocalDB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#64748B]">Driver / Package:</span>
                  <span className="font-mono text-[#172033]">Node.js mssql v11</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Audit History Retention (Days)
                </label>
                <input
                  type="number"
                  value={settings.RetentionPeriodDays}
                  onChange={(e) => setSettings({ ...settings, RetentionPeriodDays: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#138A4B]"
                />
              </div>

              <button
                type="button"
                onClick={handleSettingsSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#138A4B] hover:bg-[#22A06B] text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save System Settings'}</span>
              </button>
            </div>
          )}

          {/* THEME TAB */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[#172033] border-b border-[#F1F5F9] pb-3">
                UI/UX Design Palette
              </h3>
              <p className="text-xs text-[#64748B]">
                PhishGuard utilizes an enterprise cybersecurity Light Theme with primary green branding.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#138A4B]" />
                  <div>
                    <p className="text-[11px] font-bold text-[#172033]">Primary Green</p>
                    <p className="text-[10px] text-[#64748B] font-mono">#138A4B</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#22A06B]" />
                  <div>
                    <p className="text-[11px] font-bold text-[#172033]">Secondary Green</p>
                    <p className="text-[10px] text-[#64748B] font-mono">#22A06B</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#EAF7EF] border border-[#138A4B]/20" />
                  <div>
                    <p className="text-[11px] font-bold text-[#172033]">Light Green</p>
                    <p className="text-[10px] text-[#64748B] font-mono">#EAF7EF</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#F7F9FC] border border-[#CBD5E1]" />
                  <div>
                    <p className="text-[11px] font-bold text-[#172033]">Background</p>
                    <p className="text-[10px] text-[#64748B] font-mono">#F7F9FC</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#EF4444]" />
                  <div>
                    <p className="text-[11px] font-bold text-[#172033]">Danger Red</p>
                    <p className="text-[10px] text-[#64748B] font-mono">#EF4444</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-[#E2E8F0] bg-white flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#F59E0B]" />
                  <div>
                    <p className="text-[11px] font-bold text-[#172033]">Warning Yellow</p>
                    <p className="text-[10px] text-[#64748B] font-mono">#F59E0B</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
