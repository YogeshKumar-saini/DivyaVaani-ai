'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/lib/api/auth-service';
import { Loader2, Lock, CheckCircle2, ShieldCheck, KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new password reset link.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!token) {
      setError('Missing or invalid reset token');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      await authService.resetPassword(token, password);
      setMessage('Password reset successful! Redirecting to home...');
      setTimeout(() => router.push('/'), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/3 w-[450px] h-[350px] bg-cyan-900/8 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/3 w-[400px] h-[350px] bg-violet-900/8 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="relative rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 bg-cyan-800/12 blur-[70px] pointer-events-none rounded-full" />

          <div className="relative p-8 z-10">
            {/* Back link */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>

            {/* Icon & Title */}
            <div className="mb-7">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-white/10 flex items-center justify-center mb-4 shadow-lg">
                <KeyRound className="h-5 w-5 text-cyan-300" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Set New Password</h1>
              <p className="text-white/35 text-[13px] mt-1 font-light">
                Create a strong password for your account.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {message ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-white mb-2">Password Reset!</h3>
                  <p className="text-[13px] text-white/40 font-light leading-relaxed">{message}</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[11px] uppercase tracking-widest text-white/40 font-semibold flex items-center gap-1.5">
                      <Lock className="h-3 w-3" /> New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        disabled={!token}
                        placeholder="Min. 8 characters"
                        className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-cyan-500/40 focus:bg-white/8 transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-[11px] uppercase tracking-widest text-white/40 font-semibold flex items-center gap-1.5">
                      <Lock className="h-3 w-3" /> Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={!token}
                      placeholder="Repeat new password"
                      className={`h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/8 transition-all ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-red-500/40 focus:border-red-500/40'
                          : 'focus:border-cyan-500/40'
                      }`}
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-[11px] text-red-400/70">Passwords do not match</p>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Password tips */}
                  <div className="rounded-xl border border-white/5 bg-white/2 px-4 py-3 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-white/20 font-semibold mb-1.5">Password tips</p>
                    {[
                      { icon: ShieldCheck, text: 'At least 8 characters with uppercase & numbers', color: 'text-cyan-400' },
                      { icon: KeyRound, text: 'Link expires after 30 minutes', color: 'text-violet-400' },
                    ].map((tip, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <tip.icon className={`h-3 w-3 shrink-0 ${tip.color}`} />
                        <p className="text-[11px] text-white/30 font-light">{tip.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading || !token || (!!confirmPassword && password !== confirmPassword)}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Password'}
                  </button>

                  <p className="text-center text-[12px] text-white/25">
                    Need a new link?{' '}
                    <Link href="/forgot-password" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                      Request again
                    </Link>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/40">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          <span className="text-[14px]">Loading...</span>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
