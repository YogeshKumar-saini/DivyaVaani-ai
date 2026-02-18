"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  KeyRound,
  Loader2,
  X,
  MessageSquare,
  History,
  Infinity as InfinityIcon,
  ShieldCheck,
  Zap,
  Crown,
  Star,
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-provider";
import { authService } from "@/lib/api/auth-service";
import { GoogleLogin } from "@react-oauth/google";
import { GUEST_CHAT_LIMIT } from "@/lib/hooks/useGuestChatLimit";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GuestLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestCount: number;
  onAuthSuccess?: () => void;
  defaultTab?: "login" | "register";
}

// ─── FloatingInput ────────────────────────────────────────────────────────────

function FloatingInput({
  id,
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  required,
  icon: Icon,
  rightElement,
}: {
  id: string;
  type?: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: React.ElementType;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40"
      >
        {Icon && <Icon className="h-3 w-3 text-violet-400/70" />}
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[14px] text-white placeholder:text-white/20 focus:border-violet-400/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all duration-200 pr-10"
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Benefits data ────────────────────────────────────────────────────────────

interface BenefitItem {
  icon: React.ElementType;
  label: string;
  sub: string;
  color: string;
  border: string;
  text: string;
}

const BENEFITS: BenefitItem[] = [
  { icon: InfinityIcon, label: "Unlimited conversations",  sub: "No message caps, ever",            color: "from-violet-500/20 to-indigo-500/10",  border: "border-violet-500/20",  text: "text-violet-300" },
  { icon: History,      label: "Persistent chat history",  sub: "Pick up where you left off",       color: "from-blue-500/20 to-cyan-500/10",      border: "border-blue-500/20",    text: "text-blue-300"   },
  { icon: MessageSquare,label: "Chat sync restored",       sub: "Your guest messages imported",     color: "from-emerald-500/20 to-teal-500/10",  border: "border-emerald-500/20", text: "text-emerald-300"},
  { icon: ShieldCheck,  label: "Private & secure",         sub: "Your data stays yours",            color: "from-amber-500/20 to-orange-500/10",  border: "border-amber-500/20",   text: "text-amber-300"  },
  { icon: Zap,          label: "Priority responses",       sub: "Faster AI processing",             color: "from-rose-500/20 to-pink-500/10",     border: "border-rose-500/20",    text: "text-rose-300"   },
];

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ count, limit }: { count: number; limit: number }) {
  const pct = Math.min(count / limit, 1);
  const r = 32;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative w-[84px] h-[84px] flex items-center justify-center shrink-0">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-rose-500/10 blur-xl animate-pulse" />
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 84 84">
        <defs>
          <linearGradient id="ringTrack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
          <linearGradient id="ringFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="42" cy="42" r={r} strokeWidth="5" stroke="url(#ringTrack)" fill="none" />
        <motion.circle
          cx="42" cy="42" r={r}
          strokeWidth="5"
          fill="none"
          stroke="url(#ringFill)"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          filter="url(#ringGlow)"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - circ * pct }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-[24px] font-bold text-white leading-none">{count}</div>
        <div className="text-[10px] text-white/30 leading-none mt-0.5">/ {limit}</div>
      </div>
    </div>
  );
}

// ─── Decorative stars ─────────────────────────────────────────────────────────

function Stars() {
  const positions = [
    { top: "8%",  left: "12%",  size: 10, delay: 0 },
    { top: "15%", left: "88%",  size: 7,  delay: 0.5 },
    { top: "72%", left: "5%",   size: 8,  delay: 1 },
    { top: "82%", left: "90%",  size: 6,  delay: 0.3 },
    { top: "45%", left: "95%",  size: 9,  delay: 0.8 },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ top: p.top, left: p.left }}
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        >
          <Star className="fill-violet-300/30 text-violet-300/20" style={{ width: p.size, height: p.size }} />
        </motion.div>
      ))}
    </>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function GuestLimitModal({
  isOpen,
  onClose,
  guestCount,
  onAuthSuccess,
  defaultTab = "register",
}: GuestLimitModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { login, googleLogin, register } = useAuth();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [fullName, setFullName]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setEmail(""); setPassword(""); setFullName(""); setError("");
      setSuccessMessage(""); setIsLoading(false);
      setIsForgotPassword(false); setShowPassword(false);
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      await login({ email, password }, { redirectTo: false });
      onAuthSuccess?.(); onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally { setIsLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      await register({ email, password, full_name: fullName });
      setSuccessMessage("Account created! Signing you in…");
      try {
        await login({ email, password }, { redirectTo: false });
        onAuthSuccess?.(); onClose();
      } catch {
        setActiveTab("login");
        setSuccessMessage("Account created! Please sign in.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally { setIsLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(""); setSuccessMessage("");
    try {
      await authService.forgotPassword(email);
      setSuccessMessage("Reset link sent! Check your inbox.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset link.");
    } finally { setIsLoading(false); }
  };

  const switchTab = (tab: "login" | "register") => {
    setActiveTab(tab); setError(""); setSuccessMessage("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* ── Modal wrapper ── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.86, y: 40, filter: "blur(16px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.93, y: 20, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-[920px] relative rounded-[28px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(135deg, rgba(15,10,35,0.97) 0%, rgba(10,8,28,0.97) 50%, rgba(18,10,38,0.97) 100%)",
                boxShadow: "0 0 0 1px rgba(139,92,246,0.18), 0 50px 120px -20px rgba(0,0,0,0.95), 0 0 80px -10px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
                backdropFilter: "blur(40px) saturate(180%)",
              }}
            >
              {/* ── Top shimmer lines ── */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
              <div className="absolute top-0 inset-x-[15%] h-[2px] bg-gradient-to-r from-transparent via-purple-300/25 to-transparent blur-sm" />

              {/* ── Ambient orbs ── */}
              <div className="absolute -top-40 -left-20 w-[400px] h-[400px] rounded-full bg-violet-700/10 blur-[120px] pointer-events-none" />
              <div className="absolute -bottom-32 -right-16 w-[360px] h-[360px] rounded-full bg-rose-600/8 blur-[100px] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-indigo-900/10 blur-[80px] pointer-events-none" />

              {/* ── Grain texture ── */}
              <div
                className="absolute inset-0 opacity-[0.022] mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: "150px 150px",
                }}
              />

              {/* ── Decorative stars ── */}
              <Stars />

              {/* ── Close button ── */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-white/80 transition-all duration-200 group"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* ── Scrollable content ── */}
              <div
                className="max-h-[90vh] overflow-y-auto scrollbar-modal"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(139,92,246,0.28) transparent" }}
              >

                {/* ── Two-column layout ── */}
                <div className="relative z-10 flex flex-col lg:flex-row">

                  {/* ════════════════════════════════════════════════
                      LEFT PANEL – Limit info + benefits
                  ════════════════════════════════════════════════ */}
                  <div className="lg:w-[44%] p-7 lg:pr-5 flex flex-col gap-5 lg:border-r border-white/[0.05] relative">

                    {/* Vertical accent line */}
                    <div className="hidden lg:block absolute top-8 right-0 bottom-8 w-px bg-gradient-to-b from-transparent via-violet-500/20 to-transparent" />

                    {/* ── Header badge ── */}
                    <div className="flex items-center gap-2 mb-1">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(251,191,36,0.15))",
                          border: "1px solid rgba(245,158,11,0.25)",
                          boxShadow: "0 0 12px rgba(245,158,11,0.15)",
                        }}
                      >
                        <Crown className="h-3.5 w-3.5 text-amber-300" />
                      </motion.div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300/70">
                        Free Limit Reached
                      </span>
                    </div>

                    {/* ── Main heading ── */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-2xl bg-violet-500/25 blur-xl"
                        />
                        <div
                          className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{
                            background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.2), rgba(6,182,212,0.1))",
                            border: "1px solid rgba(139,92,246,0.2)",
                            boxShadow: "0 8px 32px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
                          }}
                        >
                          <span className="text-2xl font-serif text-white drop-shadow-lg">ॐ</span>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-[21px] font-bold text-white tracking-tight leading-tight">
                          You&apos;ve reached your<br />
                          <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #f472b6, #fb923c)" }}
                          >
                            free message limit
                          </span>
                        </h2>
                        <p className="mt-1.5 text-[13px] text-white/35 font-light leading-relaxed">
                          Create a free account to continue seeking wisdom — unlimited.
                        </p>
                      </div>
                    </div>

                    {/* ── Progress ring + stats ── */}
                    <div
                      className="flex items-center gap-5 p-4 rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      <ProgressRing count={guestCount} limit={GUEST_CHAT_LIMIT} />
                      <div className="space-y-2.5">
                        <div>
                          <div className="text-[11px] text-white/30 uppercase tracking-widest font-medium">Messages used</div>
                          <div className="text-[15px] font-semibold text-white mt-0.5">
                            {guestCount} of {GUEST_CHAT_LIMIT} free messages
                          </div>
                        </div>
                        <div
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-400" />
                          </span>
                          <span className="text-[11px] text-rose-300 font-semibold">Limit reached</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Chat history note ── */}
                    <div
                      className="p-3.5 rounded-2xl flex items-start gap-3"
                      style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(99,102,241,0.05))",
                        border: "1px solid rgba(139,92,246,0.15)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }}
                      >
                        <History className="h-4 w-4 text-violet-400" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-violet-300">Your chat will be saved</div>
                        <div className="text-[12px] text-white/35 mt-0.5 leading-relaxed">
                          After signing in, your {guestCount} guest message{guestCount !== 1 ? "s" : ""} will be automatically imported to your account.
                        </div>
                      </div>
                    </div>

                    {/* ── Benefits ── */}
                    <div>
                      <div className="text-[11px] text-white/25 uppercase tracking-widest font-semibold mb-3">
                        What you unlock — free
                      </div>
                      <div className="space-y-1.5">
                        {BENEFITS.map(({ icon: Icon, label, sub, color, border, text }, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -14 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.12 + i * 0.07, duration: 0.4, ease: "easeOut" }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 hover:bg-white/[0.025]"
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${color} ${border} border`}
                            >
                              <Icon className={`h-3.5 w-3.5 ${text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-white/85">{label}</div>
                              <div className="text-[11px] text-white/30">{sub}</div>
                            </div>
                            <CheckCircle2 className="h-4 w-4 text-emerald-400/50 shrink-0" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ════════════════════════════════════════════════
                      RIGHT PANEL – Auth forms
                  ════════════════════════════════════════════════ */}
                  <div className="lg:w-[56%] p-7 lg:pl-8 flex flex-col">

                    {/* ── Tab toggle ── */}
                    {!isForgotPassword && (
                      <div
                        className="relative mb-6 flex rounded-2xl p-1 gap-1"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <motion.div
                          layoutId="premium-modal-tab"
                          className="absolute top-1 bottom-1 rounded-xl"
                          style={{
                            width: "calc(50% - 6px)",
                            left: activeTab === "login" ? "4px" : "calc(50% + 2px)",
                            background: "linear-gradient(135deg, rgba(124,58,237,0.55), rgba(99,102,241,0.45))",
                            border: "1px solid rgba(139,92,246,0.25)",
                            boxShadow: "0 4px 16px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
                          }}
                          transition={{ type: "spring", stiffness: 420, damping: 38 }}
                        />
                        {(["register", "login"] as const).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => switchTab(tab)}
                            className={`relative z-10 flex-1 py-2.5 text-[13px] font-semibold rounded-xl transition-colors duration-200 ${
                              activeTab === tab ? "text-white" : "text-white/35 hover:text-white/60"
                            }`}
                          >
                            {tab === "login" ? "Sign In" : "Create Account"}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ── Panel heading ── */}
                    {!isForgotPassword && (
                      <div className="mb-5">
                        <h3 className="text-[19px] font-bold text-white leading-tight">
                          {activeTab === "register"
                            ? "Start your free journey"
                            : "Welcome back, seeker"}
                        </h3>
                        <p className="mt-1 text-[13px] text-white/35">
                          {activeTab === "register"
                            ? "Join thousands discovering ancient wisdom"
                            : "Continue your spiritual journey"}
                        </p>
                      </div>
                    )}

                    <AnimatePresence mode="wait">

                      {/* ── Forgot Password ── */}
                      {isForgotPassword && (
                        <motion.form
                          key="forgot"
                          initial={{ opacity: 0, x: -16, filter: "blur(8px)" }}
                          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, x: 16, filter: "blur(8px)" }}
                          transition={{ duration: 0.25 }}
                          onSubmit={handleForgotPassword}
                          className="space-y-5 flex-1"
                        >
                          <div className="mb-4">
                            <h3 className="text-[19px] font-bold text-white">Reset Password</h3>
                            <p className="mt-1 text-[13px] text-white/35">We&apos;ll send a reset link to your email</p>
                          </div>
                          <FloatingInput
                            id="gfp-email" type="email" label="Email Address"
                            placeholder="you@example.com" value={email}
                            onChange={(e) => setEmail(e.target.value)} required icon={Mail}
                          />
                          {error && <ErrorBanner message={error} />}
                          {successMessage && <SuccessBanner message={successMessage} />}
                          <PremiumButton type="submit" isLoading={isLoading}>
                            Send Reset Link
                          </PremiumButton>
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => { setIsForgotPassword(false); setError(""); setSuccessMessage(""); }}
                              className="text-[13px] text-white/35 hover:text-white/70 transition-colors"
                            >
                              ← Back to Sign In
                            </button>
                          </div>
                        </motion.form>
                      )}

                      {/* ── Register ── */}
                      {!isForgotPassword && activeTab === "register" && (
                        <motion.form
                          key="register"
                          initial={{ opacity: 0, x: 16, filter: "blur(8px)" }}
                          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, x: -16, filter: "blur(8px)" }}
                          transition={{ duration: 0.25 }}
                          onSubmit={handleRegister}
                          className="space-y-4 flex-1"
                        >
                          <FloatingInput
                            id="glm-reg-name" label="Full Name" placeholder="Arjun Sharma"
                            value={fullName} onChange={(e) => setFullName(e.target.value)}
                            required icon={User}
                          />
                          <FloatingInput
                            id="glm-reg-email" type="email" label="Email"
                            placeholder="you@example.com" value={email}
                            onChange={(e) => setEmail(e.target.value)} required icon={Mail}
                          />
                          <PasswordField
                            id="glm-reg-pw"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            showPassword={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                            placeholder="Min. 8 characters"
                            minLength={8}
                          />
                          {error && <ErrorBanner message={error} />}
                          {successMessage && <SuccessBanner message={successMessage} />}
                          <PremiumButton type="submit" isLoading={isLoading} icon={<Sparkles className="h-4 w-4" />}>
                            Create Free Account
                          </PremiumButton>
                        </motion.form>
                      )}

                      {/* ── Login ── */}
                      {!isForgotPassword && activeTab === "login" && (
                        <motion.form
                          key="login"
                          initial={{ opacity: 0, x: -16, filter: "blur(8px)" }}
                          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, x: 16, filter: "blur(8px)" }}
                          transition={{ duration: 0.25 }}
                          onSubmit={handleLogin}
                          className="space-y-4 flex-1"
                        >
                          <FloatingInput
                            id="glm-login-email" type="email" label="Email"
                            placeholder="you@example.com" value={email}
                            onChange={(e) => setEmail(e.target.value)} required icon={Mail}
                          />
                          <PasswordField
                            id="glm-login-pw"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            showPassword={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                            placeholder="Enter your password"
                            forgotPasswordAction={() => { setIsForgotPassword(true); setError(""); setSuccessMessage(""); }}
                          />
                          {error && <ErrorBanner message={error} />}
                          {successMessage && <SuccessBanner message={successMessage} />}
                          <PremiumButton type="submit" isLoading={isLoading}>
                            Sign In
                          </PremiumButton>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* ── Google OAuth divider ── */}
                    {!isForgotPassword && (
                      <>
                        <div className="relative my-5 flex items-center">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                          <span
                            className="mx-4 shrink-0 rounded-full px-3 py-1 text-[11px] uppercase tracking-widest text-white/25"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.07)",
                            }}
                          >
                            or
                          </span>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                        </div>

                        {/* Google button wrapper */}
                        <div
                          className="w-full overflow-hidden rounded-2xl transition-all duration-200 hover:border-white/15"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          }}
                        >
                          <div className="flex justify-center py-0.5">
                            <GoogleLogin
                              onSuccess={async (credentialResponse) => {
                                if (credentialResponse.credential) {
                                  try {
                                    await googleLogin(credentialResponse.credential, { redirectTo: false });
                                    onAuthSuccess?.(); onClose();
                                  } catch (e) {
                                    console.error("Google login failed", e);
                                    setError("Google authentication failed. Please try again.");
                                  }
                                }
                              }}
                              onError={() => setError("Google authentication failed. Please try again.")}
                              theme="filled_black"
                              shape="rectangular"
                              size="large"
                              width="400"
                            />
                          </div>
                        </div>

                        <p className="mt-5 text-center text-[11px] text-white/20 leading-relaxed">
                          By continuing, you agree to our{" "}
                          <a href="/terms" className="text-white/35 hover:text-violet-300/70 underline underline-offset-2 transition-colors">Terms</a>{" "}
                          &{" "}
                          <a href="/privacy" className="text-white/35 hover:text-violet-300/70 underline underline-offset-2 transition-colors">Privacy Policy</a>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Bottom shimmer ── */}
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── PasswordField ─────────────────────────────────────────────────────────────

function PasswordField({
  id,
  value,
  onChange,
  showPassword,
  onToggle,
  placeholder,
  minLength,
  forgotPasswordAction,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onToggle: () => void;
  placeholder: string;
  minLength?: number;
  forgotPasswordAction?: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
          {forgotPasswordAction ? <Lock className="h-3 w-3 text-violet-400/70" /> : <KeyRound className="h-3 w-3 text-violet-400/70" />}
          Password
        </label>
        {forgotPasswordAction && (
          <button
            type="button"
            onClick={forgotPasswordAction}
            className="text-[11px] text-violet-400/70 hover:text-violet-300 transition-colors font-semibold"
          >
            Forgot?
          </button>
        )}
      </div>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          minLength={minLength}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 pr-10 text-[14px] text-white placeholder:text-white/20 focus:border-violet-400/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── PremiumButton ─────────────────────────────────────────────────────────────

function PremiumButton({
  children,
  type = "button",
  isLoading,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  isLoading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group relative w-full h-12 rounded-xl overflow-hidden font-semibold text-[14px] text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 mt-1"
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)",
        boxShadow: "0 4px 20px rgba(124,58,237,0.4), 0 1px 0 rgba(255,255,255,0.12) inset",
      }}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
      />
      {/* Top highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {icon}
          {children}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </>
      )}
    </motion.button>
  );
}

// ─── ErrorBanner ───────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl px-4 py-3 text-[13px] text-red-300"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.18)",
      }}
    >
      {message}
    </motion.div>
  );
}

// ─── SuccessBanner ─────────────────────────────────────────────────────────────

function SuccessBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] text-emerald-300"
      style={{
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(16,185,129,0.2)",
      }}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {message}
    </motion.div>
  );
}
