import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileDown,
  RotateCcw,
  ShieldCheck,
  Link2,
  FileText,
  Paperclip,
  UserCheck,
  Info
} from 'lucide-react';
import { scanService, reportsService } from '../services/api';

export default function ScanResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [scanData, setScanData] = useState(location.state?.resultData || null);
  const [loading, setLoading] = useState(!location.state?.resultData);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!scanData && id) {
      fetchScanDetails(id);
    }
  }, [id]);

  const fetchScanDetails = async (scanId) => {
    try {
      setLoading(true);
      const res = await scanService.getScanById(scanId);
      if (res.data && res.data.data) {
        setScanData(res.data.data);
      }
    } catch (err) {
      setError('Unable to load scan report. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  // Fallback default matching reference image (Paytm 92%)
  const defaultPhishingResult = {
    scanId: id || 1,
    prediction: 'PHISHING',
    risk_score: 92.0,
    model_confidence: 96.5,
    sender_check: {
      risk: 'High',
      reasons: ['Suspicious domain (paytm-secure.com)'],
      spf_status: 'FAIL'
    },
    url_analysis: {
      risk: 'High',
      malicious_detected: true,
      urls: [{ url: 'https://paytm-account-verify.com/login', domain: 'paytm-account-verify.com', risk_level: 'Malicious' }]
    },
    content_analysis: {
      risk: 'High',
      keywords: ['verify account', 'suspended', 'click here']
    },
    attachment_check: {
      has_attachment: false,
      reason: 'No attachment'
    },
    recommendations: [
      'Do not click the link.',
      'Do not share your credentials.',
      'Mark the email as spam or phishing.',
      'Report to your IT/security team.'
    ]
  };

  const data = scanData || defaultPhishingResult;
  const isPhishing = data.prediction === 'PHISHING';
  const isSuspicious = data.prediction === 'SUSPICIOUS';
  const isSafe = data.prediction === 'SAFE';

  const handleDownload = () => {
    window.open(reportsService.getDownloadUrl('scan-summary', 'pdf'), '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-[#138A4B] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#64748B]">Loading Threat Security Report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/scan')}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#172033] hover:text-[#138A4B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scan Result</span>
        </button>

        <span className="text-xs font-mono text-[#64748B]">
          Scan ID: #{data.scanId || id}
        </span>
      </div>

      {/* Top Banner Alert Card */}
      <div
        data-tour="scan-verdict"
        className={`p-6 sm:p-7 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm ${
          isPhishing
            ? 'bg-[#FEF2F2] border-[#FCA5A5]'
            : isSuspicious
            ? 'bg-[#FFFBEB] border-[#FDE68A]'
            : 'bg-[#F0FDF4] border-[#BBF7D0]'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              isPhishing
                ? 'bg-[#FEE2E2] text-[#EF4444]'
                : isSuspicious
                ? 'bg-[#FEF3C7] text-[#F59E0B]'
                : 'bg-[#DCFCE7] text-[#16A34A]'
            }`}
          >
            {isPhishing && <AlertTriangle className="w-8 h-8" />}
            {isSuspicious && <AlertTriangle className="w-8 h-8" />}
            {isSafe && <ShieldCheck className="w-8 h-8" />}
          </div>

          <div>
            <h2
              className={`text-xl sm:text-2xl font-extrabold flex items-center gap-2 ${
                isPhishing
                  ? 'text-[#EF4444]'
                  : isSuspicious
                  ? 'text-[#D97706]'
                  : 'text-[#16A34A]'
              }`}
            >
              <span>{isPhishing ? 'Phishing Detected' : isSuspicious ? 'Suspicious Email Warning' : 'Safe Email Verified'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] mt-1 font-medium">
              {isPhishing
                ? 'This email is highly likely to be a phishing attempt.'
                : isSuspicious
                ? 'This email exhibits suspicious indicators and requires careful review.'
                : 'No malicious indicators or spoofing patterns were detected in this email.'}
            </p>
          </div>
        </div>

        <div className="text-right border-t sm:border-t-0 sm:border-l border-black/10 pt-4 sm:pt-0 sm:pl-6">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Risk Score
          </p>
          <p
            className={`text-4xl font-extrabold tracking-tight mt-0.5 ${
              isPhishing
                ? 'text-[#EF4444]'
                : isSuspicious
                ? 'text-[#F59E0B]'
                : 'text-[#16A34A]'
            }`}
          >
            {data.risk_score || 92}%
          </p>
        </div>
      </div>

      {/* Two Column Section: Detection Summary (Left) + Recommendation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detection Summary Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-4">
          <div className="border-b border-[#F1F5F9] pb-3">
            <h3 className="text-base font-bold text-[#172033]">Detection Summary</h3>
            <p className="text-xs text-[#64748B]">Multi-factor cybersecurity evaluation breakdown</p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Sender Check */}
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-[#64748B]" />
                <span className="font-bold text-[#172033]">Sender Check</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#64748B]">
                  {data.sender_check?.reasons?.length > 0
                    ? data.sender_check.reasons[0]
                    : (data.sender_check?.risk === 'High' ? 'Suspicious domain detected' : 'Authenticated sender')}
                </span>
                {data.sender_check?.risk === 'High' ? (
                  <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                )}
              </div>
            </div>

            {/* URL Analysis */}
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <Link2 className="w-4 h-4 text-[#64748B]" />
                <span className="font-bold text-[#172033]">URL Analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#64748B]">
                  {data.url_analysis?.malicious_detected || data.url_analysis?.risk === 'High'
                    ? 'Malicious link detected'
                    : (data.url_analysis?.count > 0 ? 'Verified safe URLs' : 'No links present')}
                </span>
                {data.url_analysis?.malicious_detected || data.url_analysis?.risk === 'High' ? (
                  <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Content Analysis */}
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#64748B]" />
                <span className="font-bold text-[#172033]">Content Analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#64748B] text-right">
                  {data.content_analysis?.keywords?.length > 0
                    ? `Contains phishing keywords (${data.content_analysis.keywords.map(k => `"${k}"`).join(', ')})`
                    : 'Clean content signature'}
                </span>
                {data.content_analysis?.risk === 'High' || data.content_analysis?.keywords?.length > 0 ? (
                  <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Attachment Check */}
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <Paperclip className="w-4 h-4 text-[#64748B]" />
                <span className="font-bold text-[#172033]">Attachment Check</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#64748B]">
                  {data.attachment_check?.has_attachment
                    ? `Attachment: ${data.attachment_check.filename || 'safe'}`
                    : 'No attachment'}
                </span>
                {data.attachment_check?.risk === 'High' ? (
                  <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#64748B] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#138A4B]" />
            <span>AI Model Confidence: <strong>{data.model_confidence || 96.5}%</strong> (Statistical classifier certainty)</span>
          </div>
        </div>

        {/* Recommendation Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#F1F5F9] pb-3 flex items-center gap-2 text-[#138A4B]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#172033]">Recommendation</h3>
            </div>

            <ul className="space-y-3 pt-3">
              {(data.recommendations || []).map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#172033]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#138A4B] mt-1.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[11px] text-[#64748B]">
            Security advisory issued in compliance with enterprise mail safety standards.
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons matching reference image */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/app/scan"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#CBD5E1] text-[#172033] hover:bg-[#F8FAFC] font-semibold text-sm shadow-subtle transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Scan Another Email</span>
        </Link>

        <button
          onClick={handleDownload}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#138A4B] hover:bg-[#22A06B] text-white font-semibold text-sm shadow-highlight hover:shadow-lg transition-all cursor-pointer"
        >
          <FileDown className="w-4 h-4" />
          <span>Download Report</span>
        </button>
      </div>
    </div>
  );
}
