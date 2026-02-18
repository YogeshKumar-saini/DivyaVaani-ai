'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/lib/api/auth-service';
import { Loader2, Lock, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Missing token');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await authService.resetPassword(token, password);
      setMessage('Password reset successful. Redirecting to home...');
      setTimeout(() => router.push('/'), 2200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen pt-28 px-4">
        <div className="mx-auto max-w-xl rounded-2xl border border-rose-300/30 bg-rose-400/10 p-6 text-rose-100">
          <p className="mb-4">Invalid or missing reset token.</p>
          <Link href="/" className="underline underline-offset-4 text-cyan-200 hover:text-cyan-100">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="rounded-3xl border border-cyan-200/20 bg-slate-900/60 p-8 backdrop-blur-xl shadow-[0_25px_60px_rgba(2,6,23,0.65)]">
          <h1 className="text-3xl text-slate-50" style={{ fontFamily: 'var(--font-playfair)' }}>Reset Password</h1>
          <p className="mt-2 text-slate-300 text-sm">Set a new secure password for your account.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-9 bg-slate-800/70 border-cyan-200/20 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-9 bg-slate-800/70 border-cyan-200/20 text-slate-100"
                />
              </div>
            </div>

            {error && <div className="rounded-lg border border-rose-300/30 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">{error}</div>}
            {message && <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{message}</div>}

            <Button type="submit" disabled={isLoading || Boolean(message)} className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-semibold">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Password'}
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border border-cyan-200/20 bg-slate-900/55 p-8 backdrop-blur-xl">
          <h2 className="text-2xl text-slate-50" style={{ fontFamily: 'var(--font-playfair)' }}>Security Notes</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-cyan-200/15 bg-slate-900/70 p-4">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
              <p className="mt-2 text-sm text-slate-300">Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.</p>
            </div>
            <div className="rounded-xl border border-cyan-200/15 bg-slate-900/70 p-4">
              <KeyRound className="h-5 w-5 text-cyan-200" />
              <p className="mt-2 text-sm text-slate-300">Avoid reusing old passwords from other apps or services.</p>
            </div>
            <div className="rounded-xl border border-cyan-200/15 bg-slate-900/70 p-4 text-sm text-slate-300">
              After reset, login again from Home and verify your profile details.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-200">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
