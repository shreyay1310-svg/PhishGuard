import React, { useState, useEffect } from 'react';
import {
  FileText,
  BarChart3,
  ShieldAlert,
  Users,
  Calendar,
  Download,
  Plus,
  Eye,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { reportsService } from '../services/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportsService.getReports();
      if (res.data && res.data.data) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type, format = 'pdf') => {
    const url = reportsService.getDownloadUrl(type, format);
    window.open(url, '_blank');
  };

  const handleGenerate = async (reportType) => {
    setGenerating(true);
    setSuccessMsg('');
    try {
      await reportsService.generateReport({ reportType });
      setSuccessMsg(`Successfully generated ${reportType}!`);
      fetchReports();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to generate report: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">Reports</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Generate and download email security reports.
          </p>
        </div>

        <button
          onClick={() => handleGenerate('Executive Cybersecurity Digest')}
          disabled={generating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#138A4B] hover:bg-[#22A06B] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{generating ? 'Generating...' : 'Generate Custom Report'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-[#16A34A] flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 4 Report Cards matching the user's reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Scan Summary Report */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card flex flex-col justify-between hover:border-[#138A4B]/40 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#172033]">Scan Summary Report</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Overview of scanned emails and results.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[#F1F5F9] space-y-2">
            <button
              onClick={() => handleDownload('summary', 'pdf')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#EAF7EF] hover:bg-[#138A4B] text-[#138A4B] hover:text-white text-xs font-semibold transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => handleDownload('summary', 'csv')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] font-medium text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Card 2: Threat Analysis Report */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card flex flex-col justify-between hover:border-[#138A4B]/40 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#EF4444] flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#172033]">Threat Analysis Report</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Detailed phishing and suspicious patterns.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[#F1F5F9] space-y-2">
            <button
              onClick={() => handleDownload('threat-analysis', 'pdf')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#EAF7EF] hover:bg-[#138A4B] text-[#138A4B] hover:text-white text-xs font-semibold transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => handleDownload('threat-analysis', 'csv')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] font-medium text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Card 3: User Activity Report */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card flex flex-col justify-between hover:border-[#138A4B]/40 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#172033]">User Activity Report</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Email scans and user-wise activity.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[#F1F5F9] space-y-2">
            <button
              onClick={() => handleDownload('user-activity', 'pdf')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#EAF7EF] hover:bg-[#138A4B] text-[#138A4B] hover:text-white text-xs font-semibold transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => handleDownload('user-activity', 'csv')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] font-medium text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Card 4: Monthly Security Report */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card flex flex-col justify-between hover:border-[#138A4B]/40 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#172033]">Monthly Security Report</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Aggregated monthly cyber threat insights.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[#F1F5F9] space-y-2">
            <button
              onClick={() => handleDownload('monthly-security', 'pdf')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#EAF7EF] hover:bg-[#138A4B] text-[#138A4B] hover:text-white text-xs font-semibold transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => handleDownload('monthly-security', 'csv')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] font-medium text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Reports History Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6">
        <h3 className="text-base font-bold text-[#172033] mb-1">Generated Reports Archive</h3>
        <p className="text-xs text-[#64748B] mb-4">Chronological repository of published compliance digests</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#64748B] border-b border-[#F1F5F9]">
                <th className="py-3 px-4 font-semibold">Report Title</th>
                <th className="py-3 px-4 font-semibold">Generated By</th>
                <th className="py-3 px-4 font-semibold">Date & Time</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {reports.map((r) => (
                <tr key={r.reportId} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#172033] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#138A4B]" />
                    <span>{r.title}</span>
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">{r.generatedBy}</td>
                  <td className="py-3 px-4 text-[#64748B]">
                    {new Date(r.generatedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDownload(r.title.toLowerCase().replace(/\s+/g, '-'), 'pdf')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#138A4B] hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
