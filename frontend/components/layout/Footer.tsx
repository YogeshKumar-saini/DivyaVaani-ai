'use client';

import Link from 'next/link';
import { Mail, Github, Heart, Send, Twitter, Sparkles, MessageCircle, Mic } from 'lucide-react';
import { ROUTES, APP_TITLE } from '@/lib/utils/constants';
import { useState } from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  const navLinks = [
    { label: 'Home', href: ROUTES.HOME || '/' },
    { label: 'Chat', href: ROUTES.CHAT || '/chat' },
    { label: 'Voice', href: ROUTES.VOICE || '/voice' },
    { label: 'Analytics', href: ROUTES.ANALYTICS || '/analytics' },
    { label: 'About', href: '/about' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ];

  const features = [
    { icon: MessageCircle, label: 'Text Chat', color: 'text-violet-400' },
    { icon: Mic, label: 'Voice Mode', color: 'text-cyan-400' },
    { icon: Sparkles, label: 'AI Wisdom', color: 'text-amber-400' },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/8">
      {/* Background - matches site dark theme */}
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" />

      {/* Top gradient accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      {/* Top ambient glow */}
      <div className="absolute -top-32 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[130px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />

      {/* Subtle grain texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      <div className="section-shell relative z-10 pt-14 pb-8">

        {/* Main grid — 4 equal columns (no gap column) */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* ── Brand ── */}
          <div className="space-y-5 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300/20 to-violet-500/20 border border-white/10 text-lg font-bold text-cyan-100 shadow-lg shadow-cyan-950/40 group-hover:border-cyan-300/30 transition-all duration-300">
                ॐ
              </div>
              <div>
                <p className="text-[15px] font-bold tracking-tight text-white group-hover:text-cyan-100 transition-colors">{APP_TITLE}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/50">Universal Wisdom</p>
              </div>
            </Link>

            <p className="max-w-[240px] text-[13px] leading-relaxed text-white/40 font-light">
              Spiritual guidance powered by timeless teachings and AI. Ask, listen, and reflect in your own language.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {features.map(({ icon: Icon, label, color }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-white/7 bg-white/3 px-2.5 py-1 text-[11px] text-white/35">
                  <Icon className={`h-3 w-3 ${color}`} />
                  {label}
                </span>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { icon: Github, href: '#', label: 'GitHub' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Mail, href: '#', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/35 transition-all duration-200 hover:border-cyan-300/30 hover:bg-cyan-300/8 hover:text-cyan-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Platform nav ── */}
          <div className="lg:col-span-1">
            <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">Platform</h4>
            <ul className="space-y-3">
              {navLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-[13px] text-white/40 hover:text-white/80 transition-colors duration-200"
                  >
                    <span className="h-px w-3 bg-white/15 group-hover:w-5 group-hover:bg-cyan-400/50 transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal ── */}
          <div className="lg:col-span-1">
            <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-[13px] text-white/40 hover:text-white/80 transition-colors duration-200"
                  >
                    <span className="h-px w-3 bg-white/15 group-hover:w-5 group-hover:bg-violet-400/50 transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Newsletter ── */}
          <div className="lg:col-span-1">
            <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">Stay Connected</h4>
            <p className="mb-4 text-[13px] text-white/35 font-light leading-relaxed">
              Weekly reflections, product updates, and guided prompts delivered to your inbox.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-[13px] text-emerald-300">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Subscribed! Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-xl border border-white/8 bg-white/4 px-4 pr-12 text-[13px] text-white placeholder:text-white/20 focus:border-cyan-400/30 focus:bg-white/6 focus:outline-none transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-400 to-amber-300 text-slate-950 hover:from-cyan-300 hover:to-amber-200 transition-all duration-200 shadow-lg shadow-cyan-900/30"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-white/20">No spam. Unsubscribe anytime.</p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/6 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-white/25">
            © {currentYear} DivyaVaani AI · All rights reserved
          </p>
          <p className="inline-flex items-center gap-1.5 text-[12px] text-white/20">
            Crafted with
            <Heart className="h-3 w-3 fill-rose-400/70 text-rose-400/70" />
            for mindful conversations
          </p>
        </div>
      </div>
    </footer>
  );
}
