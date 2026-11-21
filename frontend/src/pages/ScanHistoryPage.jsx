import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Eye,
  Trash2,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { scanService } from '../services/api';

export default function ScanHistoryPage() {
  const [scans, setScans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [searchTerm, statusFilter, page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await scanService.getHistory({
        search: searchTerm,
        status: statusFilter,
        page,
        limit: 10
      });
      if (res.data && res.data.data) {
        setScans(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load scan history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete scan record #${id}?`)) {
      try {
        await scanService.deleteScan(id);
        fetchHistory();
      } catch (err) {
        alert('Failed to delete scan: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleExportCSV = () => {
    window.open(scanService.exportCSV(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">Scan History</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            View and manage all your scanned emails.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#172033] shadow-subtle transition-all"
        >
          <Download className="w-4 h-4 text-[#64748B]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Filter Toolbar matching reference image */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by subject or sender..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#138A4B]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] text-xs font-medium">
            {['ALL', 'PHISHING', 'SUSPICIOUS', 'SAFE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-white text-[#138A4B] font-bold shadow-sm'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Date Filter Dropdown */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#172033]">
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scan History Table matching reference image */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#64748B] border-b border-[#F1F5F9]">
                <th className="py-3.5 px-4 font-semibold w-12">#</th>
                <th className="py-3.5 px-4 font-semibold">Subject</th>
                <th className="py-3.5 px-4 font-semibold">Sender</th>
                <th className="py-3.5 px-4 font-semibold">Result</th>
                <th className="py-3.5 px-4 font-semibold">Risk Score</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#64748B]">
                    Loading scan history records...
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#64748B]">
                    No email scans match your filter criteria.
                  </td>
                </tr>
              ) : (
                scans.map((scan, idx) => (
                  <tr key={scan.scanId} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 text-[#94A3B8] font-mono">
                      {(page - 1) * 10 + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#172033] max-w-xs truncate">
                      {scan.subject}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px] max-w-xs truncate">
                      {scan.sender}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          scan.result === 'PHISHING'
                            ? 'bg-red-50 text-[#EF4444]'
                            : scan.result === 'SUSPICIOUS'
                            ? 'bg-amber-50 text-[#F59E0B]'
                            : 'bg-green-50 text-[#16A34A]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            scan.result === 'PHISHING'
                              ? 'bg-[#EF4444]'
                              : scan.result === 'SUSPICIOUS'
                              ? 'bg-[#F59E0B]'
                              : 'bg-[#16A34A]'
                          }`}
                        />
                        {scan.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-[#172033]">
                      {scan.riskScore}%
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] text-[11px]">
                      {new Date(scan.scannedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}{' '}
                      {new Date(scan.scannedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/app/scan/result/${scan.scanId}`}
                          title="View Scan Details"
                          className="p-1.5 text-[#64748B] hover:text-[#138A4B] rounded-lg hover:bg-[#EAF7EF] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(scan.scanId)}
                          title="Delete Scan Record"
                          className="p-1.5 text-[#64748B] hover:text-[#EF4444] rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
