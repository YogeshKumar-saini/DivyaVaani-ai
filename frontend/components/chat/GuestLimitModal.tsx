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
  Infinity,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-provider";
import { authService } from "@/lib/api/auth-service";
import { GoogleLogin } from "@react-oauth/google";
import { GUEST_CHAT_LIMIT } from "@/lib/hooks/useGuestChatLimit";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GuestLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** How many messages the guest already sent */
  guestCount: number;
  /** Triggered after successful login/register so caller can sync messages */
  onAuthSuccess?: () => void;
  defaultTab?: "login" | "register";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/35"
      >
        {Icon && <Icon className="h-3 w-3" />}
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
          className="h-11 w-full rounded-xl border border-white/8 bg-white/4 px-4 text-[14px] text-white placeholder:text-white/20 focus:border-violet-400/40 focus:bg-white/7 focus:outline-none transition-all duration-200 pr-10"
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

const BENEFITS = [
  {
    icon: Infinity,
    label: "Unlimited conversations",
    sub: "No message caps, ever",
  },
  {
    icon: History,
    label: "Persistent chat history",
    sub: "Pick up where you left off",
  },
  {
    icon: MessageSquare,
    label: "Chat sync restored",
    sub: "Your guest messages imported",
  },
  {
    icon: ShieldCheck,
    label: "Private & secure",
    sub: "Your data stays yours",
  },
  {
    icon: Zap,
    label: "Priority responses",
    sub: "Faster AI processing",
  },
];

// ─── Progress Arc ─────────────────────────────────────────────────────────────

function ProgressRing({
  count,
  limit,
}: {
  count: number;
  limit: number;
}) {
  const pct = Math.min(count / limit, 1);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
        {/* Track */}
        <circle cx="40" cy="40" r={r} strokeWidth="6" stroke="rgba(255,255,255,0.06)" fill="none" />
        {/* Progress */}
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          strokeWidth="6"
          fill="none"
          stroke="url(#limitGrad)"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id="limitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <div className="text-[22px] font-bold text-white leading-none">{count}</div>
        <div className="text-[10px] text-white/30 leading-none mt-0.5">/ {limit}</div>
      </div>
    </div>
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setFullName("");
      setError("");
      setSuccessMessage("");
      setIsLoading(false);
      setIsForgotPassword(false);
      setShowPassword(false);
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      // redirectTo: false keeps the user on the current page (chat) so sync can run
      await login({ email, password }, { redirectTo: false });
      onAuthSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await register({ email, password, full_name: fullName });
      setSuccessMessage("Account created! Signing you in…");
      // Auto-login after register — stay on page for sync
      try {
        await login({ email, password }, { redirectTo: false });
        onAuthSuccess?.();
        onClose();
      } catch {
        setActiveTab("login");
        setSuccessMessage("Account created! Please sign in.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await authService.forgotPassword(email);
      setSuccessMessage("Reset link sent! Check your inbox.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset link."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab: "login" | "register") => {
    setActiveTab(tab);
    setError("");
    setSuccessMessage("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.88, y: 32, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.92, y: 16, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-[900px] max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/92 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top shimmer */}
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-violet-400/60 to-transparent" />
              <div className="absolute top-0 inset-x-[20%] h-0.5 bg-linear-to-r from-transparent via-rose-400/30 to-transparent blur-sm" />

              {/* Ambient glows */}
              <div className="absolute -top-32 left-1/4 w-96 h-80 bg-violet-700/15 blur-[100px] pointer-events-none rounded-full" />
              <div className="absolute -bottom-24 right-1/4 w-80 h-64 bg-rose-600/10 blur-[80px] pointer-events-none rounded-full" />

              {/* Grain texture */}
              <div
                className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none rounded-3xl"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: "160px 160px",
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 flex items-center justify-center text-white/30 hover:text-white/70 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Two-column layout */}
              <div className="relative z-10 flex flex-col lg:flex-row">

                {/* ── Left Panel: Limit info + benefits ── */}
                <div className="lg:w-[44%] p-8 lg:pr-6 flex flex-col gap-6 lg:border-r border-white/6">

                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-xl animate-pulse" />
                      <div className="relative w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500/30 via-indigo-500/20 to-cyan-500/10 border border-white/12 flex items-center justify-center shadow-xl">
                        <span className="text-xl font-serif text-white drop-shadow-lg">ॐ</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-[20px] font-bold text-white tracking-tight leading-tight">
                        You&apos;ve reached your<br />
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-violet-400 to-rose-400">
                          free message limit
                        </span>
                      </h2>
                      <p className="mt-1 text-[13px] text-white/35 font-light leading-relaxed">
                        Create a free account to keep seeking wisdom — unlimited.
                      </p>
                    </div>
                  </div>

                  {/* Progress ring + stats */}
                  <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/3 border border-white/6">
                    <ProgressRing count={guestCount} limit={GUEST_CHAT_LIMIT} />
                    <div className="space-y-2">
                      <div>
                        <div className="text-[11px] text-white/30 uppercase tracking-widest font-medium">Messages sent</div>
                        <div className="text-[15px] font-semibold text-white">
                          {guestCount} of {GUEST_CHAT_LIMIT} free messages
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        <span className="text-[11px] text-rose-300 font-medium">Limit reached</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat history note */}
                  <div className="p-3.5 rounded-2xl bg-violet-500/8 border border-violet-500/15 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <History className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-violet-300">Your chat will be saved</div>
                      <div className="text-[12px] text-white/35 mt-0.5 leading-relaxed">
                        After signing in, your {guestCount} guest message{guestCount !== 1 ? "s" : ""} will be automatically imported to your account.
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <div className="text-[11px] text-white/25 uppercase tracking-widest font-medium mb-3">
                      What you unlock for free
                    </div>
                    {BENEFITS.map(({ icon: Icon, label, sub }, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
                        className="flex items-center gap-3 py-2"
                      >
                        <div className="w-7 h-7 rounded-lg bg-violet-500/12 border border-violet-500/15 flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-white/80">{label}</div>
                          <div className="text-[11px] text-white/30">{sub}</div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400/60 shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* ── Right Panel: Auth forms ── */}
                <div className="lg:w-[56%] p-8 lg:pl-8">

                  {/* Tab toggle */}
                  {!isForgotPassword && (
                    <div className="relative mb-6 flex rounded-xl border border-white/7 bg-white/3 p-1 gap-1">
                      <motion.div
                        layoutId="guest-modal-tab-pill"
                        className="absolute top-1 bottom-1 rounded-lg bg-linear-to-r from-violet-600/50 to-indigo-600/40 border border-violet-400/20 shadow-lg shadow-violet-900/30"
                        style={{
                          width: "calc(50% - 6px)",
                          left: activeTab === "login" ? "4px" : "calc(50% + 2px)",
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                      {(["register", "login"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => switchTab(tab)}
                          className={`relative z-10 flex-1 py-2 text-[13px] font-semibold rounded-lg transition-colors duration-200 ${
                            activeTab === tab
                              ? "text-white"
                              : "text-white/35 hover:text-white/60"
                          }`}
                        >
                          {tab === "login" ? "Sign In" : "Create Account"}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Heading */}
                  {!isForgotPassword && (
                    <div className="mb-5">
                      <h3 className="text-[18px] font-bold text-white leading-tight">
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
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        onSubmit={handleForgotPassword}
                        className="space-y-5"
                      >
                        <div className="mb-4">
                          <h3 className="text-[18px] font-bold text-white">Reset Password</h3>
                          <p className="mt-1 text-[13px] text-white/35">We&apos;ll send a reset link to your email</p>
                        </div>
                        <FloatingInput
                          id="gfp-email"
                          type="email"
                          label="Email Address"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          icon={Mail}
                        />
                        {error && <ErrorBanner message={error} />}
                        {successMessage && <SuccessBanner message={successMessage} />}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-11 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 transition-all duration-300 disabled:opacity-60"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                        </button>
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
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        onSubmit={handleRegister}
                        className="space-y-4"
                      >
                        <FloatingInput
                          id="glm-reg-name"
                          label="Full Name"
                          placeholder="Arjun Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          icon={User}
                        />
                        <FloatingInput
                          id="glm-reg-email"
                          type="email"
                          label="Email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          icon={Mail}
                        />
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                            <KeyRound className="h-3 w-3" /> Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              minLength={8}
                              placeholder="Min. 8 characters"
                              className="h-11 w-full rounded-xl border border-white/8 bg-white/4 px-4 pr-10 text-[14px] text-white placeholder:text-white/20 focus:border-violet-400/40 focus:bg-white/7 focus:outline-none transition-all duration-200"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {error && <ErrorBanner message={error} />}
                        {successMessage && <SuccessBanner message={successMessage} />}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="group w-full h-11 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 transition-all duration-300 disabled:opacity-60 mt-1"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Create Free Account
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </>
                          )}
                        </button>
                      </motion.form>
                    )}

                    {/* ── Login ── */}
                    {!isForgotPassword && activeTab === "login" && (
                      <motion.form
                        key="login"
                        initial={{ opacity: 0, x: -16, filter: "blur(8px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, x: 16, filter: "blur(8px)" }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        onSubmit={handleLogin}
                        className="space-y-4"
                      >
                        <FloatingInput
                          id="glm-login-email"
                          type="email"
                          label="Email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          icon={Mail}
                        />
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                              <Lock className="h-3 w-3" /> Password
                            </label>
                            <button
                              type="button"
                              onClick={() => { setIsForgotPassword(true); setError(""); setSuccessMessage(""); }}
                              className="text-[11px] text-violet-400/80 hover:text-violet-300 transition-colors font-medium"
                            >
                              Forgot?
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              placeholder="Enter your password"
                              className="h-11 w-full rounded-xl border border-white/8 bg-white/4 px-4 pr-10 text-[14px] text-white placeholder:text-white/20 focus:border-violet-400/40 focus:bg-white/7 focus:outline-none transition-all duration-200"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {error && <ErrorBanner message={error} />}
                        {successMessage && <SuccessBanner message={successMessage} />}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="group w-full h-11 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 transition-all duration-300 disabled:opacity-60 mt-1"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Sign In
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </>
                          )}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Google OAuth */}
                  {!isForgotPassword && (
                    <>
                      <div className="relative my-5 flex items-center">
                        <div className="flex-1 border-t border-white/8" />
                        <span className="mx-4 shrink-0 rounded-full border border-white/8 bg-white/3 px-3 py-1 text-[11px] uppercase tracking-widest text-white/25">
                          or
                        </span>
                        <div className="flex-1 border-t border-white/8" />
                      </div>

                      <div className="w-full overflow-hidden rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/12 transition-all duration-200">
                        <div className="flex justify-center py-0.5">
                          <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                              if (credentialResponse.credential) {
                                try {
                                  // Stay on page for sync
                                  await googleLogin(credentialResponse.credential, { redirectTo: false });
                                  onAuthSuccess?.();
                                  onClose();
                                } catch (e) {
                                  console.error("Google login failed", e);
                                  setError("Google authentication failed. Please try again.");
                                }
                              }
                            }}
                            onError={() => {
                              setError("Google authentication failed. Please try again.");
                            }}
                            theme="filled_black"
                            shape="rectangular"
                            size="large"
                            width="400"
                          />
                        </div>
                      </div>

                      <p className="mt-4 text-center text-[11px] text-white/20 leading-relaxed">
                        By continuing, you agree to our{" "}
                        <a href="/terms" className="text-white/35 hover:text-white/60 underline underline-offset-2 transition-colors">
                          Terms
                        </a>{" "}
                        &{" "}
                        <a href="/privacy" className="text-white/35 hover:text-white/60 underline underline-offset-2 transition-colors">
                          Privacy Policy
                        </a>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Utility sub-components ────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
    >
      {message}
    </motion.div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-[13px] text-emerald-300"
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {message}
    </motion.div>
  );
}
