import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Scan,
  History,
  FileBarChart,
  Activity,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Bell,
  HelpCircle
} from 'lucide-react';
import GuidedTour from '../components/GuidedTour';

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = JSON.parse(localStorage.getItem('phishguard_user') || 'null') || {
    fullName: 'Shreya Yadav',
    email: 'admin@phishguard.cyber',
    role: 'Admin'
  };

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, tourId: 'nav-dashboard' },
    { name: 'Scan Email', path: '/app/scan', icon: Scan, tourId: 'nav-scan' },
    { name: 'Scan History', path: '/app/history', icon: History, tourId: 'nav-history' },
    { name: 'Reports', path: '/app/reports', icon: FileBarChart, tourId: 'nav-reports' },
    { name: 'Threat Insights', path: '/app/threats', icon: Activity, tourId: 'nav-threats' },
    { name: 'Users', path: '/app/users', icon: Users, tourId: 'nav-users' },
    { name: 'Settings', path: '/app/settings', icon: Settings, tourId: 'nav-settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('phishguard_token');
    localStorage.removeItem('phishguard_user');
    navigate('/login');
  };

  const handleReplayTour = () => {
    if (window.__replayPhishGuardTour) {
      window.__replayPhishGuardTour();
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F9FC] overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-[#F1F5F9]">
            <NavLink to="/app/dashboard" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7EF] flex items-center justify-center text-[#138A4B] shadow-sm">
                <Shield className="w-6 h-6 fill-[#138A4B]/20" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#172033]">
                Phish<span className="text-[#138A4B]">Guard</span>
              </span>
            </NavLink>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-[#64748B] hover:text-[#172033]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/app/scan' && location.pathname.startsWith('/app/scan/'));
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  data-tour={item.tourId}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-[#138A4B] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Tour Launcher */}
          <div className="px-4">
            <button
              onClick={handleReplayTour}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#EAF7EF] text-[#138A4B] hover:bg-[#138A4B] hover:text-white text-xs font-semibold transition-all group"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>Product Tour</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* User Card at Bottom */}
        <div className="p-4 border-t border-[#F1F5F9]">
          <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#138A4B]/10 border border-[#138A4B]/20 flex items-center justify-center text-[#138A4B] font-bold text-sm">
                {storedUser.fullName ? storedUser.fullName.split(' ').map(n => n[0]).join('') : 'SY'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-[#172033] truncate leading-tight">
                  {storedUser.fullName || 'Shreya Yadav'}
                </p>
                <p className="text-xs text-[#64748B] leading-tight">
                  {storedUser.role || 'Admin'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-[#64748B] hover:text-[#EF4444] rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Mobile Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-[#64748B] hover:text-[#172033] rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#138A4B]" />
            <span className="font-bold text-[#172033]">PhishGuard</span>
          </div>
          <button
            onClick={handleReplayTour}
            className="p-2 text-[#138A4B] hover:bg-[#EAF7EF] rounded-lg"
            title="Start Tour"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Interactive Guided Tour Walkthrough Component */}
      <GuidedTour />
    </div>
  );
}
