'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/lib/api/auth-service';
import {
  Loader2,
  Mail,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      {/* Page glows */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[400px] bg-violet-900/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/3 w-[400px] h-[400px] bg-indigo-900/8 blur-[110px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[600px]"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">

          {/* ── Main Card ── */}
          <div className="relative rounded-3xl border border-white/10 bg-slate-950/85 backdrop-blur-3xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
            {/* Top shimmer lines */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
            <div className="absolute top-0 inset-x-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm" />
            {/* Ambient glows */}
            <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-64 bg-violet-700/20 blur-[90px] pointer-events-none rounded-full" />
            <div className="absolute -bottom-20 -right-16 w-56 h-56 bg-indigo-600/15 blur-[70px] pointer-events-none rounded-full" />
            <div className="absolute top-1/2 -left-12 w-32 h-64 bg-cyan-600/8 blur-[60px] pointer-events-none" />
            {/* Grain */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: '160px 160px' }} />

            <div className="relative p-8 z-10">
              {/* Back link */}
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[12px] text-white/25 hover:text-white/60 transition-colors mb-7"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>

              {/* Logo & Title */}
              <div className="mb-7">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-xl animate-pulse" />
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 via-indigo-500/20 to-cyan-500/10 border border-white/12 flex items-center justify-center shadow-xl shadow-violet-900/40">
                      <KeyRound className="h-5 w-5 text-violet-300" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 flex items-center justify-center shadow-lg shadow-violet-900/50">
                      <Sparkles className="h-1.5 w-1.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-[20px] font-bold text-white tracking-tight">Reset Password</h1>
                    <p className="text-[12px] text-white/35 font-light mt-0.5">
                      We&apos;ll send a secure link to your email
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-4"
                  >
                    <div className="relative mb-5">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                      <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                      </div>
                    </div>
                    <h3 className="text-[17px] font-semibold text-white mb-2">Check Your Email</h3>
                    <p className="text-[13px] text-white/40 font-light leading-relaxed mb-1">
                      We sent a reset link to
                    </p>
                    <p className="text-[13px] text-violet-300 font-semibold mb-5">{email}</p>
                    <p className="text-[12px] text-white/25 mb-6">
                      Check your inbox and spam folder. Link expires in 30 minutes.
                    </p>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[13px] transition-all duration-300 shadow-lg shadow-violet-900/30"
                    >
                      Return to Sign In
                    </Link>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                        <Mail className="h-3 w-3" /> Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="h-11 w-full rounded-xl border border-white/8 bg-white/4 px-4 text-[14px] text-white placeholder:text-white/20 focus:border-violet-400/40 focus:bg-white/7 focus:outline-none transition-all duration-200"
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
                      >
                        {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                    </button>

                    <p className="text-center text-[12px] text-white/25">
                      Remember your password?{' '}
                      <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                        Sign in
                      </Link>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Security Notes Card ── */}
          <div className="relative rounded-3xl border border-white/8 bg-slate-950/60 backdrop-blur-2xl shadow-xl shadow-black/40 overflow-hidden md:w-[200px]">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none" style={{ backgroundImage: GRAIN, backgroundSize: '160px 160px' }} />

            <div className="relative p-5 z-10 space-y-4">
              <h2 className="text-[12px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Security
              </h2>

              {[
                {
                  icon: KeyRound,
                  text: 'Links expire in 30 minutes',
                  color: 'text-violet-400',
                  bg: 'bg-violet-500/8',
                  border: 'border-violet-500/15',
                },
                {
                  icon: ShieldCheck,
                  text: 'Use 8+ chars with uppercase & numbers',
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/8',
                  border: 'border-emerald-500/15',
                },
                {
                  icon: Mail,
                  text: 'Check spam if not in inbox',
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-500/8',
                  border: 'border-cyan-500/15',
                },
              ].map((item, i) => (
                <div key={i} className={`flex gap-2.5 p-3 rounded-xl border ${item.border} ${item.bg}`}>
                  <item.icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${item.color}`} />
                  <p className="text-[11px] text-white/35 font-light leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Feature hint */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/20">
          <Sparkles className="h-3 w-3 text-amber-400/50" />
          <span>Your account security is our priority</span>
        </div>
      </motion.div>
    </div>
  );
}
