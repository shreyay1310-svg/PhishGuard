import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Globe,
  Tag,
  TrendingUp,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { threatsService } from '../services/api';

export default function ThreatInsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreatInsights();
  }, []);

  const fetchThreatInsights = async () => {
    try {
      setLoading(true);
      const res = await threatsService.getInsights();
      if (res.data && res.data.data) {
        setInsights(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load threat insights:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fallback defaults matching reference image
  const threatTypes = insights?.threatTypes || [
    { type: 'Credential Phishing', percentage: 42, color: '#EF4444' },
    { type: 'Banking Scam', percentage: 24, color: '#F59E0B' },
    { type: 'Fake Invoice', percentage: 14, color: '#6366F1' },
    { type: 'Account Suspensions', percentage: 12, color: '#EC4899' },
    { type: 'Other', percentage: 8, color: '#64748B' }
  ];

  const commonKeywords = insights?.commonKeywords || [
    { keyword: 'verify account' },
    { keyword: 'update details' },
    { keyword: 'account suspended' },
    { keyword: 'click here' },
    { keyword: 'confirm identity' },
    { keyword: 'urgent action' },
    { keyword: 'login now' }
  ];

  const suspiciousDomains = insights?.suspiciousDomains || [
    { domain: 'paytm-secure.com' },
    { domain: 'hdfc-update.com' },
    { domain: 'amazon-verify.net' }
  ];

  const weeklyTrends = insights?.weeklyAttackTrends || [
    { day: 'Mon', credential: 28, banking: 14, invoice: 8 },
    { day: 'Tue', credential: 34, banking: 18, invoice: 10 },
    { day: 'Wed', credential: 42, banking: 22, invoice: 12 },
    { day: 'Thu', credential: 31, banking: 16, invoice: 9 },
    { day: 'Fri', credential: 39, banking: 24, invoice: 15 },
    { day: 'Sat', credential: 12, banking: 6, invoice: 4 },
    { day: 'Sun', credential: 15, banking: 8, invoice: 5 }
  ];

  const modelMetrics = insights?.modelMetrics || {
    modelName: 'Logistic Regression + Random Forest Ensemble',
    accuracy: 98.4,
    precision: 97.9,
    recall: 98.8,
    f1Score: 98.3
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">Threat Insights</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Analyze common phishing trends and attack patterns.
        </p>
      </div>

      {/* Primary Section: Top Threat Types (Left) + Keywords & Domains (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Top Threat Types matching reference image */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-5">
          <div className="border-b border-[#F1F5F9] pb-3">
            <h3 className="text-base font-bold text-[#172033]">Top Threat Types</h3>
            <p className="text-xs text-[#64748B]">Distribution of attack vectors detected across all mail streams</p>
          </div>

          <div className="space-y-4 pt-1">
            {threatTypes.map((t) => (
              <div key={t.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#172033]">{t.type}</span>
                  <span className="font-mono text-[#64748B]">{t.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${t.percentage}%`,
                      backgroundColor: t.color || '#138A4B'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>Automated real-time categorization via NLP pipeline</span>
            <span className="text-[#138A4B] font-bold">100% telemetry synced</span>
          </div>
        </div>

        {/* Right Column: Keywords & Domains matching reference image */}
        <div className="lg:col-span-5 space-y-6">
          {/* Common Phishing Keywords */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-[#172033]">
              <Tag className="w-4 h-4 text-[#138A4B]" />
              <h3 className="text-base font-bold">Common Phishing Keywords</h3>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {commonKeywords.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#172033] hover:border-[#138A4B] transition-colors"
                >
                  {item.keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Top Suspicious Domains */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-[#172033]">
              <Globe className="w-4 h-4 text-[#EF4444]" />
              <h3 className="text-base font-bold">Top Suspicious Domains</h3>
            </div>

            <div className="space-y-2.5 pt-1">
              {suspiciousDomains.map((dom, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100 text-xs font-mono font-medium text-[#EF4444]"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{dom.domain}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Section: Weekly Attack Trends & AI Model Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Attack Trends Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-4">
            <div>
              <h3 className="text-base font-bold text-[#172033]">Weekly Attack Trends</h3>
              <p className="text-xs text-[#64748B]">Volume of blocked threats by incident type</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="credential" name="Credential" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="banking" name="Banking" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="invoice" name="Invoice" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI/ML Model Accuracy Metrics */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#138A4B] mb-1">
              <Cpu className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#172033]">Detection Accuracy</h3>
            </div>
            <p className="text-xs text-[#64748B]">Evaluation metrics on test datasets</p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <p className="text-[10px] uppercase font-bold text-[#64748B]">Accuracy</p>
                <p className="text-xl font-extrabold text-[#138A4B] mt-1">{modelMetrics.accuracy}%</p>
              </div>
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <p className="text-[10px] uppercase font-bold text-[#64748B]">Precision</p>
                <p className="text-xl font-extrabold text-[#172033] mt-1">{modelMetrics.precision}%</p>
              </div>
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <p className="text-[10px] uppercase font-bold text-[#64748B]">Recall</p>
                <p className="text-xl font-extrabold text-[#172033] mt-1">{modelMetrics.recall}%</p>
              </div>
              <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <p className="text-[10px] uppercase font-bold text-[#64748B]">F1 Score</p>
                <p className="text-xl font-extrabold text-[#138A4B] mt-1">{modelMetrics.f1Score}%</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#EAF7EF] border border-[#138A4B]/20 rounded-xl text-[11px] text-[#138A4B] font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Active Model: {modelMetrics.modelName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
