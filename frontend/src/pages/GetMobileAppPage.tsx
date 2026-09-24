import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';

export const GetMobileAppPage: React.FC = () => {
  const [downloadStarted, setDownloadStarted] = useState(false);

  // Official Verified GitHub Release APK URLs
  const apkDownloadUrl =
    'https://github.com/aravindbala03112003/eduhelp-student-support/releases/download/v1.0.0/EduHelp-Android-v1.0.0-arm64.apk';
  const universalApkUrl =
    'https://github.com/aravindbala03112003/eduhelp-student-support/releases/download/v1.0.0/EduHelp-Android-v1.0.0-universal.apk';
  const releasePageUrl =
    'https://github.com/aravindbala03112003/eduhelp-student-support/releases/tag/v1.0.0';

  const handleDownload = (targetUrl = apkDownloadUrl, fileName = 'EduHelp-Android-v1.0.0-arm64.apk') => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Flutter Android Companion Client • v1.0.0 Release</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          Stay connected to your support requests wherever you are.
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          The EduHelp mobile companion app enables students to submit tickets, reply to staff requests, track SLA countdowns, and receive push notifications on the go.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Download className="w-5 h-5" />}
            onClick={() => handleDownload(apkDownloadUrl, 'EduHelp-Android-v1.0.0-arm64.apk')}
            className="w-full sm:w-auto shadow-md"
          >
            Download Android APK (ARM64 • 16.6 MB)
          </Button>
          <a
            href={releasePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            GitHub Release Assets
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Optimized ARM64: <strong>16.58 MB</strong>
          </span>
          <span>•</span>
          <span>Android 8.0+ (API 26+)</span>
          <span>•</span>
          <a
            href={universalApkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Universal APK (46.5 MB)
          </a>
        </div>

        {downloadStarted && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            ✓ Download initiated from GitHub Release. Follow the installation steps below to install on your Android device.
          </div>
        )}
      </div>


      {/* Interactive Phone Mockup & Key Highlights Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-card rounded-2xl border border-border p-8 lg:p-12 shadow-card">
        {/* Left: Realistic Smartphone Frame Mockup */}
        <div className="flex items-center justify-center">
          <div className="w-[280px] sm:w-[320px] h-[580px] bg-slate-900 rounded-[42px] p-3 shadow-2xl ring-1 ring-slate-800 relative">
            {/* Speaker & Camera Notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>

            {/* Inner Phone Screen */}
            <div className="w-full h-full bg-slate-950 text-white rounded-[32px] overflow-hidden flex flex-col justify-between pt-8 pb-3 px-4 border border-slate-800 select-none">
              {/* Phone Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1">
                    <span>5G</span>
                    <div className="w-3.5 h-2 border border-slate-400 rounded-sm" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">EduHelp Student App</span>
                    <span className="text-sm font-bold text-white">Hello, Aarav Patel</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary/30 text-primary flex items-center justify-center text-xs font-bold border border-primary/50">
                    AP
                  </div>
                </div>
              </div>

              {/* Phone Content Simulation */}
              <div className="space-y-3 my-auto">
                {/* Simulated Stat Card */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Requests</span>
                    <span className="text-lg font-bold block text-white">2 in progress</span>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>

                {/* Simulated Ticket Card 1 */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-primary font-bold">EDU-20260924-1004</span>
                    <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
                      Waiting Input
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white line-clamp-1">
                    Bonafide Certificate for Passport Renewal
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Officer Priya requested ID proof attachment.
                  </p>
                  <div className="text-[9px] text-emerald-400 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3" /> SLA due in 29h 45m
                  </div>
                </div>

                {/* Simulated Ticket Card 2 */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-400">EDU-20260924-1001</span>
                    <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-medium">
                      New
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                    Tuition Fee Receipt for Education Loan
                  </p>
                </div>
              </div>

              {/* Phone Bottom Nav Simulation */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-4 text-center text-[10px] text-slate-400">
                <div className="text-primary flex flex-col items-center">
                  <span>Home</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>Tickets</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>+ Create</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Key Feature Highlights */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Native Experience, Shared Architecture
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Designed from the ground up to integrate seamlessly with the same Express REST API, ensuring immediate synchronization with desktop administrators.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Instant Request Notifications
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  Receive alerts the moment support staff reply, request additional documentation, or resolve your inquiry.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Live SLA Countdown & Age Tracking
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  Full transparency into institutional target deadlines with automatic SLA status indicator chips.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Offline-Resilient Token Auth
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  Encrypted secure mobile session storage matching institutional single-sign-on requirements.
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Quick Scan */}
          <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-center gap-4">
            <a
              href={apkDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 bg-white border border-border rounded-lg flex items-center justify-center p-1 shrink-0 shadow-subtle hover:scale-105 transition-transform"
              title="Click or scan to download APK"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${encodeURIComponent(apkDownloadUrl)}`}
                alt="Scan to Download EduHelp Android APK"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </a>
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Direct Device Install QR
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Scan with your Android camera or tap to download the verified 16.6 MB APK directly to your phone.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Installation Instructions */}
      <div className="p-6 sm:p-8 bg-card rounded-xl border border-border shadow-card space-y-4">
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          How to Install EduHelp APK on Android
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
              1
            </span>
            <span className="font-semibold text-foreground block">Download APK</span>
            <p className="text-muted-foreground leading-relaxed">
              Tap the download button above or scan the QR code to save the `.apk` package to your Android Downloads folder.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
              2
            </span>
            <span className="font-semibold text-foreground block">Enable Unknown Sources</span>
            <p className="text-muted-foreground leading-relaxed">
              When prompted by Android, allow installation from this browser/file source under <em>Settings &gt; Install Unknown Apps</em>.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
              3
            </span>
            <span className="font-semibold text-foreground block">Open & Sign In</span>
            <p className="text-muted-foreground leading-relaxed">
              Open EduHelp from your app drawer and sign in using your standard student email and credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
