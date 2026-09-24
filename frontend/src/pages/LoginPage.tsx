import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/common/Button.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      // Route based on role
      if (user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else if (user.role === 'MANAGER') {
        navigate('/manager/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground">
      {/* Left Column: Brand Hero & Value Proposition */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo & Name */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white">EduHelp</h1>
            <p className="text-xs text-slate-400">Institutional Service Desk</p>
          </div>
        </div>

        {/* Center: Mission Statement & Key Features */}
        <div className="my-10 relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Campus Support Platform</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
            One place for every student request.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Empowering universities with SLA-governed ticket lifecycle tracking, automated escalations, workload balance, and mobile accessibility.
          </p>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                <strong className="text-white">Deterministic SLA Governance:</strong> Real-time tracking with proactive breach and at-risk notifications.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                <strong className="text-white">Strict Role-Based Access:</strong> Total seclusion between student conversation threads and internal staff audit notes.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                <strong className="text-white">Cross-Platform Synchronized:</strong> Unified REST API powering both web app and native Flutter Android companion client.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Tagline / Assessment credit */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between relative z-10">
          <span>Engineered for Edumerge Solutions Assessment</span>
          <span>Version 1.0.0</span>
        </div>
      </div>

      {/* Right Column: Premium Login Form Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Sign in to your account
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a demo role below or enter your institutional credentials.
            </p>
          </div>

          {/* Quick 1-Click Demo Login Bar */}
          <div className="p-3.5 bg-muted/60 rounded-xl border border-border space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              1-Click Demo Credentials (Pre-configured)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('student@eduhelp.demo')}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-primary/10 hover:border-primary/40 text-xs font-medium text-foreground transition-colors flex flex-col items-center"
              >
                <span>Student</span>
                <span className="text-[10px] text-muted-foreground">Aarav Patel</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('staff@eduhelp.demo')}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-primary/10 hover:border-primary/40 text-xs font-medium text-foreground transition-colors flex flex-col items-center"
              >
                <span>Staff</span>
                <span className="text-[10px] text-muted-foreground">Priya Sharma</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('manager@eduhelp.demo')}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-primary/10 hover:border-primary/40 text-xs font-medium text-foreground transition-colors flex flex-col items-center"
              >
                <span>Manager</span>
                <span className="text-[10px] text-muted-foreground">Dr. Rao</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-medium text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@eduhelp.demo"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-foreground">
                  Password
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Demo: <code className="bg-muted px-1 rounded text-primary">password123</code>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                Remember this device
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              Sign In to EduHelp
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
