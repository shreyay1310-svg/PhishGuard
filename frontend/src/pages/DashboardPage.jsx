import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Eye,
  PlusCircle,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardService } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStats();
      if (res.data && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Default fallback data matching reference image
  const defaultScanTrend = [
    { date: 'Oct 25', safe: 42, phishing: 8, suspicious: 5 },
    { date: 'Oct 28', safe: 65, phishing: 12, suspicious: 7 },
    { date: 'Nov 1', safe: 110, phishing: 18, suspicious: 10 },
    { date: 'Nov 4', safe: 95, phishing: 14, suspicious: 8 },
    { date: 'Nov 7', safe: 135, phishing: 22, suspicious: 12 },
    { date: 'Nov 10', safe: 115, phishing: 16, suspicious: 9 },
    { date: 'Nov 13', safe: 155, phishing: 28, suspicious: 14 },
    { date: 'Nov 16', safe: 125, phishing: 19, suspicious: 11 },
    { date: 'Nov 19', safe: 140, phishing: 24, suspicious: 13 }
  ];

  const defaultDonut = [
    { name: 'Safe', value: 932, percentage: 74.7, color: '#16A34A' },
    { name: 'Phishing', value: 213, percentage: 17.1, color: '#EF4444' },
    { name: 'Suspicious', value: 103, percentage: 8.2, color: '#F59E0B' }
  ];

  const scanTrend = stats?.scanTrend || defaultScanTrend;
  const donutData = stats?.threatDistribution || defaultDonut;

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Overview of your email security and threat detection</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#172033] shadow-subtle">
            <Calendar className="w-4 h-4 text-[#64748B]" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>Year to Date</option>
            </select>
          </div>

          <Link
            to="/app/scan"
            className="inline-flex items-center gap-2 bg-[#138A4B] hover:bg-[#22A06B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scanned */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Scanned</p>
            <h3 className="text-3xl font-extrabold text-[#172033] mt-2">
              {stats?.totalScanned?.value || '1,248'}
            </h3>
            <p className="text-xs text-[#138A4B] font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats?.totalScanned?.change || '+12% from last month'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        {/* Safe Emails */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Safe Emails</p>
            <h3 className="text-3xl font-extrabold text-[#172033] mt-2">
              {stats?.safeEmails?.value || '932'}
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-1">
              {stats?.safeEmails?.percentage || '74.7% of total'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EAF7EF] text-[#16A34A] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Phishing Detected */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Phishing Detected</p>
            <h3 className="text-3xl font-extrabold text-[#172033] mt-2">
              {stats?.phishingDetected?.value || '213'}
            </h3>
            <p className="text-xs text-[#EF4444] font-medium mt-1">
              {stats?.phishingDetected?.percentage || '17.1% of total'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#EF4444] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Suspicious */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Suspicious</p>
            <h3 className="text-3xl font-extrabold text-[#172033] mt-2">
              {stats?.suspiciousEmails?.value || '103'}
            </h3>
            <p className="text-xs text-[#F59E0B] font-medium mt-1">
              {stats?.suspiciousEmails?.percentage || '8.2% of total'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Email Scan Trend Line/Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4 gap-2">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Email Scan Trend</h2>
              <p className="text-xs text-[#64748B]">Daily safe vs malicious detection volumes</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#16A34A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" /> Safe
              </span>
              <span className="flex items-center gap-1.5 text-[#EF4444]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Phishing
              </span>
              <span className="flex items-center gap-1.5 text-[#F59E0B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Suspicious
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scanTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="phishGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="safe" stroke="#16A34A" strokeWidth={2.5} fillOpacity={1} fill="url(#safeGrad)" />
                <Area type="monotone" dataKey="phishing" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#phishGrad)" />
                <Area type="monotone" dataKey="suspicious" stroke="#F59E0B" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Threat Distribution</h2>
            <p className="text-xs text-[#64748B]">Classification ratio over period</p>
          </div>

          <div className="relative h-48 w-full flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-[#172033]">1,248</span>
              <span className="text-[11px] font-medium text-[#64748B]">Emails</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 pt-3 border-t border-[#F1F5F9]">
            {donutData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#172033] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold text-[#64748B]">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Latest Alerts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Scan Activity */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Recent Scan Activity</h2>
              <p className="text-xs text-[#64748B]">Latest verified email scans from SQL Server</p>
            </div>
            <Link
              to="/app/history"
              className="text-xs font-semibold text-[#138A4B] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#64748B] border-b border-[#F1F5F9]">
                  <th className="pb-3 font-semibold">Subject</th>
                  <th className="pb-3 font-semibold">Sender</th>
                  <th className="pb-3 font-semibold">Result</th>
                  <th className="pb-3 font-semibold">Risk Score</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {(stats?.recentScans || []).map((scan) => (
                  <tr key={scan.scanId} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 font-semibold text-[#172033] max-w-[180px] truncate">
                      {scan.subject}
                    </td>
                    <td className="py-3 text-[#64748B] max-w-[160px] truncate">
                      {scan.sender}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          scan.result === 'PHISHING'
                            ? 'bg-red-50 text-[#EF4444]'
                            : scan.result === 'SUSPICIOUS'
                            ? 'bg-amber-50 text-[#F59E0B]'
                            : 'bg-green-50 text-[#16A34A]'
                        }`}
                      >
                        {scan.result}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-semibold text-[#172033]">
                      {scan.riskScore}%
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/app/scan/result/${scan.scanId}`}
                        className="p-1.5 text-[#64748B] hover:text-[#138A4B] inline-flex items-center"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Security Alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#172033]">Latest Security Alerts</h2>
            <p className="text-xs text-[#64748B]">Real-time SIEM alerts and updates</p>

            <div className="mt-4 space-y-3.5">
              {(stats?.securityAlerts || []).map((alert) => (
                <div key={alert.id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        alert.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : alert.severity === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#172033] mt-2">{alert.title}</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/app/threats"
            className="w-full mt-4 py-2.5 text-center text-xs font-semibold text-[#138A4B] bg-[#EAF7EF] hover:bg-[#138A4B] hover:text-white rounded-xl transition-all"
          >
            Explore Threat Intelligence
          </Link>
        </div>
      </div>
    </div>
  );
}
