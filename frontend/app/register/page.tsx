'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/auth-provider';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    setIsLoading(true);
    setError('');
    try {
      await register({ email, password, full_name: fullName });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-2xl shadow-black/60 p-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
            <p className="text-white/40 text-sm font-light mb-6">
              Your journey with DivyaVaani begins now. Please sign in to continue.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[14px] transition-all duration-300"
            >
              Sign In to Continue
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      {/* Ambient glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[400px] bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-900/8 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="relative rounded-3xl border border-white/10 bg-slate-950/85 backdrop-blur-3xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
          {/* Top shimmer lines */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
          <div className="absolute top-0 inset-x-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm" />
          {/* Ambient glows */}
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-64 bg-indigo-700/20 blur-[90px] pointer-events-none rounded-full" />
          <div className="absolute -bottom-20 -right-16 w-56 h-56 bg-violet-600/15 blur-[70px] pointer-events-none rounded-full" />
          <div className="absolute top-1/2 -left-12 w-32 h-64 bg-cyan-600/8 blur-[60px] pointer-events-none" />
          {/* Grain texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '160px 160px' }} />

          <div className="relative p-8 z-10">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-indigo-500/30 blur-xl animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-cyan-500/10 border border-white/12 flex items-center justify-center shadow-xl shadow-indigo-900/40">
                    <span className="text-2xl font-serif text-white drop-shadow-lg">ॐ</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-violet-300 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-[22px] font-bold text-white tracking-tight">Join DivyaVaani</h1>
              <p className="text-[13px] text-white/35 mt-1.5 font-light">Begin your path with ancient wisdom & AI</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-[11px] uppercase tracking-widest text-white/40 font-semibold flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 focus:bg-white/8 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] uppercase tracking-widest text-white/40 font-semibold flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 focus:bg-white/8 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[11px] uppercase tracking-widest text-white/40 font-semibold flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 focus:bg-white/8 transition-all pr-10"
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
                  placeholder="Repeat password"
                  className={`h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/8 transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-500/40 focus:border-red-500/40'
                      : 'focus:border-violet-500/50'
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-red-400/80">Passwords do not match</p>
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || (!!confirmPassword && password !== confirmPassword)}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center">
              <div className="flex-1 border-t border-white/8" />
              <span className="mx-4 shrink-0 rounded-full border border-white/8 bg-white/3 px-3 py-1 text-[11px] uppercase tracking-widest text-white/25">
                or continue with
              </span>
              <div className="flex-1 border-t border-white/8" />
            </div>

            {/* Google Login */}
            <div className="w-full overflow-hidden rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/12 transition-all duration-200">
              <div className="flex justify-center py-0.5">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                      try {
                        await googleLogin(credentialResponse.credential);
                      } catch {
                        setError('Google login failed. Please try again.');
                      }
                    }
                  }}
                  onError={() => setError('Google login failed. Please try again.')}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  width="380"
                  text="continue_with"
                  logo_alignment="left"
                  locale="en"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-[13px] text-white/30">
                Already have an account?{' '}
                <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
              <p className="text-[11px] text-white/20">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="text-white/35 hover:text-white/60 underline underline-offset-2 transition-colors">Terms</a>
                {' '}& {' '}
                <a href="/privacy" className="text-white/35 hover:text-white/60 underline underline-offset-2 transition-colors">Privacy</a>
              </p>
            </div>
          </div>
        </div>

        {/* Feature hint */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/20">
          <Sparkles className="h-3 w-3 text-amber-400/50" />
          <span>Your spiritual journey starts here</span>
        </div>
      </motion.div>
    </div>
  );
}
