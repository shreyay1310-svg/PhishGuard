import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Cpu,
  Link2,
  CheckCircle2,
  Paperclip,
  Lock,
  Zap,
  BarChart3,
  FileCheck,
  Eye,
  AlertTriangle,
  Server
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col justify-between">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EAF7EF] flex items-center justify-center text-[#138A4B]">
              <Shield className="w-6 h-6 fill-[#138A4B]/20" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#172033]">
              Phish<span className="text-[#138A4B]">Guard</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <a href="#hero" className="hover:text-[#138A4B] transition-colors">Home</a>
            <a href="#features" className="hover:text-[#138A4B] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#138A4B] transition-colors">How It Works</a>
            <a href="#about" className="hover:text-[#138A4B] transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-[#172033] hover:text-[#138A4B] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-full bg-[#138A4B] text-white text-sm font-semibold hover:bg-[#22A06B] shadow-sm hover:shadow transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF7EF] border border-[#138A4B]/20 text-xs font-semibold text-[#138A4B]">
              <span className="w-2 h-2 rounded-full bg-[#138A4B] animate-pulse" />
              AI-Powered Email Security
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#172033] tracking-tight leading-[1.15]">
              Detect. Prevent. <br />
              <span className="text-[#138A4B]">Stay Safe.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed">
              PhishGuard uses Artificial Intelligence and Machine Learning to analyze email content, sender information, URLs, and attachments to detect phishing attempts in real time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/app/scan"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#138A4B] text-white font-semibold text-sm hover:bg-[#22A06B] shadow-highlight hover:shadow-lg transition-all"
              >
                <span>Scan an Email</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-xl bg-white border border-[#E2E8F0] text-[#172033] font-semibold text-sm hover:bg-[#F8FAFC] transition-colors"
              >
                Learn More
              </a>
            </div>

            {/* Feature Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#E2E8F0]">
              <div className="flex items-center gap-2 text-xs font-medium text-[#172033] bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                <Cpu className="w-4 h-4 text-[#138A4B]" />
                <span>AI/ML Detection</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#172033] bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                <Link2 className="w-4 h-4 text-[#138A4B]" />
                <span>URL Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#172033] bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                <CheckCircle2 className="w-4 h-4 text-[#138A4B]" />
                <span>Sender Check</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#172033] bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                <Paperclip className="w-4 h-4 text-[#138A4B]" />
                <span>Attachment Scan</span>
              </div>
            </div>
          </div>

          {/* Right Column: Cybersecurity 3D Graphic */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-md aspect-square bg-gradient-to-tr from-[#EAF7EF] to-white rounded-3xl p-8 border border-[#E2E8F0] shadow-card relative overflow-hidden flex flex-col items-center justify-center text-center">
              {/* Decorative Rings */}
              <div className="absolute w-72 h-72 rounded-full border border-[#138A4B]/10 animate-ping opacity-25" />
              <div className="absolute w-96 h-96 rounded-full border border-[#138A4B]/15" />

              {/* Laptop & Shield Graphic */}
              <div className="relative z-10 w-48 h-32 bg-[#172033] rounded-t-xl border-4 border-[#334155] shadow-2xl flex flex-col items-center justify-center p-3">
                <div className="w-12 h-12 rounded-full bg-[#EAF7EF] flex items-center justify-center text-[#138A4B] mb-2 shadow-inner">
                  <Shield className="w-7 h-7 fill-[#138A4B]" />
                </div>
                <div className="h-2 w-24 bg-[#138A4B] rounded-full" />
                <div className="h-1.5 w-16 bg-[#334155] rounded-full mt-1.5" />
              </div>
              <div className="w-56 h-3 bg-[#64748B] rounded-b-lg shadow-md mb-6 relative z-10" />

              {/* Floating Alert Badges */}
              <div className="relative z-10 bg-white border border-[#E2E8F0] px-4 py-2.5 rounded-xl shadow-subtle flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#138A4B]" />
                <span className="text-xs font-bold text-[#172033]">Real-Time Threat Shield Active</span>
                <span className="text-[10px] font-mono text-[#138A4B] bg-[#EAF7EF] px-1.5 py-0.5 rounded">99.8% Accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How PhishGuard Works */}
      <section id="how-it-works" className="py-20 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#138A4B] mb-2">Workflow Architecture</h2>
            <p className="text-3xl font-extrabold text-[#172033]">How PhishGuard Works</p>
            <p className="text-sm text-[#64748B] mt-3">From intake to multi-layer machine learning and explainable risk scores.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E2E8F0]">
              <div className="w-12 h-12 rounded-xl bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mb-5 font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-[#172033] mb-2">Ingestion & Extraction</h3>
              <p className="text-sm text-[#64748B]">
                Paste raw emails or upload .eml / .msg files. The parser extracts header signals, display names, URLs, and attachments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E2E8F0]">
              <div className="w-12 h-12 rounded-xl bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mb-5 font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-[#172033] mb-2">AI/ML Classification</h3>
              <p className="text-sm text-[#64748B]">
                Our Python FastAPI engine deploys TF-IDF and Random Forest models alongside URL typosquatting and SPF/DKIM verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E2E8F0]">
              <div className="w-12 h-12 rounded-xl bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mb-5 font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-[#172033] mb-2">SSMS Audit & Reporting</h3>
              <p className="text-sm text-[#64748B]">
                Scans are persisted into Microsoft SQL Server (PhishGuardDB), rendering interactive dashboard telemetry and downloadable PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-wider uppercase text-[#138A4B] mb-2">Capabilities</h2>
          <p className="text-3xl font-extrabold text-[#172033]">Enterprise-Grade Email Defense</p>
          <p className="text-sm text-[#64748B] mt-3">Comprehensive cybersecurity features designed for analysts and administrators.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-card hover:border-[#138A4B]/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#172033] mb-1">Real AI/ML Classifier</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Trained on real-world phishing and legitimate corpora with genuine probability outputs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-card hover:border-[#138A4B]/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mb-4">
              <Link2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#172033] mb-1">Typosquatting Detection</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Detects brand spoofing like paytm-secure.com, hdfc-update.com, and malicious IP hosts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-card hover:border-[#138A4B]/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#172033] mb-1">SQL Server Backend</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Enterprise persistence via Microsoft SQL Server managed through SSMS with stored procedures.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-card hover:border-[#138A4B]/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#172033] mb-1">Audit Reports & Export</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Download formatted PDF security digests and CSV incident logs with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-white border-t border-[#E2E8F0] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#138A4B]" />
            <span className="font-bold text-lg text-[#172033]">PhishGuard</span>
            <span className="text-xs text-[#64748B] ml-2">© 2026 PhishGuard Cyber Systems. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#64748B]">
            <Link to="/login" className="hover:text-[#138A4B]">Login</Link>
            <Link to="/register" className="hover:text-[#138A4B]">Register</Link>
            <a href="#hero" className="hover:text-[#138A4B]">Documentation</a>
            <a href="#hero" className="hover:text-[#138A4B]">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
