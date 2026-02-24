'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/auth-provider';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const performGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await googleLogin(tokenResponse.access_token);
      } catch {
        setError('Google login failed. Please try again.');
      }
    },
    onError: () => setError('Google login failed. Please try again.')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login({ email, password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-900/8 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="relative rounded-3xl border border-white/10 bg-slate-950/85 backdrop-blur-3xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
          {/* Top shimmer lines */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
          <div className="absolute top-0 inset-x-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm" />
          {/* Ambient glows */}
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-64 bg-violet-700/20 blur-[90px] pointer-events-none rounded-full" />
          <div className="absolute -bottom-20 -right-16 w-56 h-56 bg-indigo-600/15 blur-[70px] pointer-events-none rounded-full" />
          <div className="absolute top-1/2 -left-12 w-32 h-64 bg-cyan-600/8 blur-[60px] pointer-events-none" />
          {/* Grain texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '160px 160px' }} />

          <div className="relative p-8 z-10">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-xl animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 via-indigo-500/20 to-cyan-500/10 border border-white/12 flex items-center justify-center shadow-xl shadow-violet-900/40">
                    <span className="text-2xl font-serif text-white drop-shadow-lg">ॐ</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 flex items-center justify-center shadow-lg shadow-violet-900/50">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-[22px] font-bold text-white tracking-tight">Welcome Back</h1>
              <p className="text-[13px] text-white/35 mt-1.5 font-light">Sign in to continue your spiritual journey</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[11px] uppercase tracking-widest text-white/40 font-semibold flex items-center gap-1.5">
                    <Lock className="h-3 w-3" /> Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-[12px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
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
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="h-4 w-4" /></>
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
            <div className="w-full">
              <button
                type="button"
                onClick={() => performGoogleLogin()}
                className="relative w-full h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-3 text-[14px] font-medium text-white group"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-[13px] text-white/30">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  Sign up free
                </Link>
              </p>
              <p className="text-[11px] text-white/20">
                By continuing, you agree to our{' '}
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
          <span>Access ancient wisdom through AI-powered guidance</span>
        </div>
      </motion.div>
    </div>
  );
}
