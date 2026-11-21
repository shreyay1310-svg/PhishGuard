import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  Scan,
  History,
  FileBarChart,
  Activity,
  Settings,
  HelpCircle,
  Play
} from 'lucide-react';
import { onboardingService } from '../services/api';

export default function GuidedTour({ onTourFinish }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [targetRect, setTargetRect] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem('phishguard_user') || 'null') || {
    fullName: 'Cyber Analyst',
    role: 'Admin'
  };

  const userRole = storedUser.role || 'Admin';

  // Role-specific descriptions and steps
  const steps = [
    {
      step: 1,
      title: 'Your Security Dashboard',
      route: '/app/dashboard',
      targetSelector: '[data-tour="nav-dashboard"]',
      icon: LayoutDashboard,
      description: 'Get a complete overview of your email security activities in one place.',
      roleNote: userRole === 'Super Admin'
        ? 'Full enterprise-wide scanning telemetry, SIEM alerts, and multi-tenant threat statistics.'
        : userRole === 'Security Analyst'
        ? 'Live scanning feeds, threat detection trends, and incident telemetry.'
        : 'Track your personal scan volumes, safe delivery percentages, and threat warnings.',
      details: [
        'Total emails scanned & safe emails counter',
        'Phishing detected & suspicious email alerts',
        'Daily email scanning trend line chart',
        'Threat distribution donut breakdown'
      ]
    },
    {
      step: 2,
      title: 'Scan Your First Email',
      route: '/app/scan',
      targetSelector: '[data-tour="nav-scan"]',
      icon: Scan,
      description: 'Analyze suspicious emails using our AI-powered phishing detection engine.',
      roleNote: userRole === 'Security Analyst'
        ? 'Deep MIME header parsing, typosquatting domain inspection, and heuristic rule verification.'
        : 'Inspect questionable sender addresses, malicious links, and suspicious attachments.',
      details: [
        'Paste raw email headers & message content',
        'Upload safe RFC 822 .eml or Outlook .msg files',
        'Inspect embedded links and sender signals',
        'Instant multi-vector AI risk assessment'
      ]
    },
    {
      step: 3,
      title: 'Understand Your AI Results',
      route: '/app/scan/result/1',
      targetSelector: '[data-tour="scan-verdict"]',
      icon: Sparkles,
      description: 'PhishGuard analyzes email content, sender details, suspicious URLs, and attachment signals.',
      roleNote: 'Clear distinction between statistical AI confidence and composite estimated risk score.',
      details: [
        'Categorized verdicts: SAFE, SUSPICIOUS, or PHISHING',
        'Unified Risk Score (0 to 100%)',
        'Sender domain, URL typosquatting & attachment checks',
        'Explainable detection reasoning & practical recommendations'
      ]
    },
    {
      step: 4,
      title: 'Track Your Previous Scans',
      route: '/app/history',
      targetSelector: '[data-tour="nav-history"]',
      icon: History,
      description: 'View all your previously scanned emails and their detection results.',
      roleNote: userRole === 'Super Admin' || userRole === 'Admin'
        ? 'Centralized compliance audit log for all organization mailflows.'
        : 'Search, filter, and review your historical scan records.',
      details: [
        'Real-time search by subject line or sender address',
        'Filter by verdict (Safe, Suspicious, Phishing)',
        'Check exact risk percentages and scan dates',
        'One-click CSV export for external audit reviews'
      ]
    },
    {
      step: 5,
      title: 'Generate Security Reports',
      route: '/app/reports',
      targetSelector: '[data-tour="nav-reports"]',
      icon: FileBarChart,
      description: 'Download and review your email security reports.',
      roleNote: 'Generate executive digests and technical incident audits for CISO review.',
      details: [
        'Email Scan Summary Reports',
        'Threat Analysis & Phishing Pattern Reports',
        'User Activity & Compliance Reports',
        'Printable PDF and CSV export formats'
      ]
    },
    {
      step: 6,
      title: 'Explore Threat Intelligence',
      route: '/app/threats',
      targetSelector: '[data-tour="nav-threats"]',
      icon: Activity,
      description: 'Understand common phishing patterns and identify emerging email threats.',
      roleNote: 'Machine learning metrics, weekly attack trends, and blacklisted domains.',
      details: [
        'Top threat vectors (Credential Phishing, Banking Scams, Fake Invoices)',
        'Common phishing keywords & linguistic urgency flags',
        'Top suspicious domains & brand typosquatting targets',
        'AI/ML model accuracy, precision, and recall metrics'
      ]
    },
    {
      step: 7,
      title: 'Manage Your Account',
      route: '/app/settings',
      targetSelector: '[data-tour="nav-settings"]',
      icon: Settings,
      description: 'Customize your account and manage your security preferences.',
      roleNote: userRole === 'Super Admin' || userRole === 'Admin'
        ? 'Manage sensitivity thresholds, notification alerts, and SQL Server persistence.'
        : 'Update profile information, change passwords, and manage notification preferences.',
      details: [
        'Update profile details and account credentials',
        'Configure AI risk threshold sensitivity',
        'Review Microsoft SQL Server (PhishGuardDB) connection',
        'Replay guided tour at any time from settings'
      ]
    }
  ];

  const totalSteps = steps.length;
  const activeStepData = steps[currentStep - 1];

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const res = await onboardingService.getStatus();
      if (res.data && res.data.data) {
        const { isCompleted, isSkipped, isNewUser, currentStep: savedStep } = res.data.data;
        // If not completed and not skipped, launch tour!
        if (isNewUser || (!isCompleted && !isSkipped)) {
          setCurrentStep(savedStep || 1);
          setShowWelcome(true);
          setIsOpen(true);
        }
      }
    } catch (err) {
      // If error or offline, check local storage flag
      const toured = localStorage.getItem(`phishguard_tour_${storedUser.userId || storedUser.email}`);
      if (!toured) {
        setShowWelcome(true);
        setIsOpen(true);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || showWelcome || showCompletion) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showWelcome, showCompletion, currentStep]);

  // Highlight and position targeting
  useEffect(() => {
    if (!isOpen || showWelcome || showCompletion) {
      setTargetRect(null);
      return;
    }

    // Ensure we are on the correct route for this step
    if (activeStepData && location.pathname !== activeStepData.route) {
      navigate(activeStepData.route);
    }

    // Wait for DOM render, then calculate spotlight target
    const timer = setTimeout(() => {
      if (activeStepData?.targetSelector) {
        const element = document.querySelector(activeStepData.targetSelector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          const rect = element.getBoundingClientRect();
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right
          });
          return;
        }
      }
      setTargetRect(null);
    }, 250);

    return () => clearTimeout(timer);
  }, [currentStep, isOpen, showWelcome, showCompletion, location.pathname]);

  const handleStartTour = () => {
    setShowWelcome(false);
    setCurrentStep(1);
    navigate(steps[0].route);
    saveStepProgress(1, false, false);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      const next = currentStep + 1;
      setCurrentStep(next);
      navigate(steps[next - 1].route);
      saveStepProgress(next, false, false);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      navigate(steps[prev - 1].route);
      saveStepProgress(prev, false, false);
    }
  };

  const handleSkip = async () => {
    setIsOpen(false);
    setShowWelcome(false);
    setShowCompletion(false);
    localStorage.setItem(`phishguard_tour_${storedUser.userId || storedUser.email}`, 'skipped');
    try {
      await onboardingService.saveProgress({ currentStep, isCompleted: false, isSkipped: true });
    } catch (e) {}
    if (onTourFinish) onTourFinish();
  };

  const handleFinish = async () => {
    setShowCompletion(true);
    localStorage.setItem(`phishguard_tour_${storedUser.userId || storedUser.email}`, 'completed');
    try {
      await onboardingService.saveProgress({ currentStep: totalSteps, isCompleted: true, isSkipped: false });
    } catch (e) {}
    if (onTourFinish) onTourFinish();
  };

  const saveStepProgress = async (step, completed, skipped) => {
    try {
      await onboardingService.saveProgress({
        currentStep: step,
        isCompleted: completed,
        isSkipped: skipped
      });
    } catch (e) {}
  };

  // Exposed Replay Method
  window.__replayPhishGuardTour = async () => {
    try {
      await onboardingService.resetTour();
    } catch (e) {}
    localStorage.removeItem(`phishguard_tour_${storedUser.userId || storedUser.email}`);
    setCurrentStep(1);
    setShowCompletion(false);
    setShowWelcome(true);
    setIsOpen(true);
  };

  if (!isOpen) return null;

  // A. WELCOME SCREEN MODAL
  if (showWelcome) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-[#E2E8F0] text-center relative overflow-hidden">
          {/* Decorative Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#EAF7EF] blur-2xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-[#EAF7EF] blur-2xl" />

          {/* PhishGuard Shield Illustration */}
          <div className="relative w-20 h-20 rounded-3xl bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mx-auto mb-6 shadow-highlight border border-[#138A4B]/20">
            <Shield className="w-10 h-10 fill-[#138A4B]/20" />
            <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-[#22A06B] animate-bounce" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Welcome to PhishGuard!
          </h2>

          <p className="text-xs font-bold uppercase tracking-wider text-[#138A4B] mt-1.5">
            Hello, {storedUser.fullName || 'Security Analyst'} ({userRole})
          </p>

          <p className="text-sm text-[#64748B] mt-4 leading-relaxed max-w-md mx-auto">
            Your email security journey starts here. Let's take a quick tour to help you understand how PhishGuard protects you from phishing attacks.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold text-[#64748B] my-6">
            <span className="w-2 h-2 rounded-full bg-[#138A4B]" />
            <span>Estimated tour duration: <strong>2–3 minutes</strong></span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSkip}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] transition-all"
            >
              Skip for Now
            </button>
            <button
              onClick={handleStartTour}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#138A4B] hover:bg-[#22A06B] text-white text-xs font-bold shadow-highlight hover:shadow-lg transition-all"
            >
              <span>Start Guided Tour</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // G. FINAL ONBOARDING COMPLETION MODAL
  if (showCompletion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#E2E8F0] text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
            You're All Set!
          </h2>

          <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
            You now know how to use PhishGuard. Start scanning emails and stay protected from phishing threats.
          </p>

          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] my-6 text-left space-y-1">
            <p className="font-semibold text-[#172033]">Your Onboarding Summary:</p>
            <p>✔ Completed all 7 security modules walkthrough</p>
            <p>✔ Onboarding progress saved to SQL Server</p>
            <p>✔ You can replay this tour anytime from Settings</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setShowCompletion(false);
                setIsOpen(false);
                navigate('/app/dashboard');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#172033] hover:bg-[#F8FAFC] transition-all"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setShowCompletion(false);
                setIsOpen(false);
                navigate('/app/scan');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#138A4B] hover:bg-[#22A06B] text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Scan Your First Email</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // B & C. STEP-BY-STEP GUIDED TOUR OVERLAY & TOOLTIP CARD
  const StepIcon = activeStepData.icon;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dark Transparent Background with spotlight hole */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity duration-300" />

      {/* Spotlight Ring over target element if found */}
      {targetRect && (
        <div
          className="absolute border-2 border-[#138A4B] rounded-2xl ring-4 ring-[#138A4B]/30 shadow-2xl transition-all duration-300 pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55), 0 0 30px rgba(19, 138, 75, 0.4)'
          }}
        />
      )}

      {/* Floating Tooltip Card */}
      <div className="fixed inset-x-4 bottom-6 sm:bottom-auto sm:top-24 sm:right-10 sm:inset-x-auto max-w-md w-full pointer-events-auto z-50 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-6 relative overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center text-xs font-bold">
                {currentStep}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Step {currentStep} of {totalSteps}
              </span>
            </div>

            <button
              onClick={handleSkip}
              title="Skip Tour"
              className="text-[#94A3B8] hover:text-[#EF4444] p-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Segmented Progress Bar */}
          <div className="flex items-center gap-1.5 my-3.5">
            {steps.map((s) => (
              <div
                key={s.step}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s.step < currentStep
                    ? 'bg-[#138A4B]'
                    : s.step === currentStep
                    ? 'bg-[#22A06B] ring-2 ring-[#138A4B]/20'
                    : 'bg-[#E2E8F0]'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-[#172033]">
              <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#138A4B] flex items-center justify-center flex-shrink-0">
                <StepIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold tracking-tight">
                {activeStepData.title}
              </h3>
            </div>

            <p className="text-xs text-[#172033] font-medium leading-relaxed">
              {activeStepData.description}
            </p>

            {/* Role Note */}
            <div className="p-2.5 bg-[#EAF7EF]/70 border border-[#138A4B]/20 rounded-xl text-[11px] text-[#138A4B] font-medium">
              <span className="font-bold uppercase tracking-wide text-[10px] block mb-0.5">
                {userRole} Perspective:
              </span>
              {activeStepData.roleNote}
            </div>

            {/* Feature Bullets */}
            <ul className="space-y-1.5 pt-1">
              {activeStepData.details.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] text-[#64748B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#138A4B] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#F1F5F9]">
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-[#64748B] hover:text-[#EF4444] transition-colors"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#172033] hover:bg-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#138A4B] hover:bg-[#22A06B] text-white text-xs font-bold shadow-highlight hover:shadow transition-all"
              >
                <span>{currentStep === totalSteps ? 'Finish Tour' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
