"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/auth-provider";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { authService } from "@/lib/api/auth-service";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

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
      <Label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/35"
      >
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </Label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-white/8 bg-white/4 px-4 text-[14px] text-white placeholder:text-white/20 focus:border-violet-400/50 focus:bg-white/7 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] focus:outline-none transition-all duration-200 pr-10"
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

export function AuthModal({
  isOpen,
  onOpenChange,
  defaultTab = "login",
}: AuthModalProps) {
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

  const performGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // useGoogleLogin implicit flow returns access_token in tokenResponse.access_token
        await googleLogin(tokenResponse.access_token);
        onOpenChange(false);
      } catch (e) {
        console.error("Google login failed", e);
        setError("Google authentication failed. Please try again.");
      }
    },
    onError: () => {
      setError("Google authentication failed. Please try again.");
    },
  });

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError("");
    setSuccessMessage("");
    setIsLoading(false);
    setIsForgotPassword(false);
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login({ email, password });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
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
      setSuccessMessage("Account created! You can now sign in.");
      setActiveTab("login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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
      setSuccessMessage("Reset link sent! Check your email inbox.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab: "login" | "register") => {
    setActiveTab(tab);
    setError("");
    setSuccessMessage("");
  };

  const heading = isForgotPassword
    ? "Reset Password"
    : activeTab === "login"
      ? "Welcome Back"
      : "Create Account";

  const subheading = isForgotPassword
    ? "Enter your email and we'll send a reset link"
    : activeTab === "login"
      ? "Sign in to continue your spiritual journey"
      : "Begin your path with ancient wisdom & AI";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden bg-transparent border-0 shadow-none [&>button]:text-white/40 [&>button]:hover:text-white/70 [&>button]:z-50">
        <DialogHeader className="sr-only">
          <DialogTitle>{heading}</DialogTitle>
          <DialogDescription>{subheading}</DialogDescription>
        </DialogHeader>
        {/* Glass card */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0B0F19]/90 backdrop-blur-3xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">

          {/* Top shimmer line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          <div className="absolute top-0 inset-x-[15%] h-0.5 bg-linear-to-r from-transparent via-white/20 to-transparent blur-sm" />

          {/* Ambient glows */}
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-64 bg-violet-700/20 blur-[90px] pointer-events-none rounded-full" />
          <div className="absolute -bottom-20 -right-16 w-56 h-56 bg-indigo-600/15 blur-[70px] pointer-events-none rounded-full" />
          <div className="absolute top-1/2 -left-12 w-32 h-64 bg-cyan-600/8 blur-[60px] pointer-events-none" />

          {/* Grain texture */}
          <div
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '160px 160px',
            }}
          />

          <div className="relative z-10 p-8">

            {/* Header */}
            <div className="mb-7 text-center">
              {/* Animated logo orb */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-violet-500/30 blur-xl animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-violet-500/30 via-indigo-500/20 to-cyan-500/10 border border-white/12 flex items-center justify-center shadow-xl shadow-violet-900/40">
                    <span className="text-2xl font-serif text-white drop-shadow-lg">ॐ</span>
                  </div>
                  {/* Sparkle dot */}
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-linear-to-br from-cyan-300 to-violet-400 flex items-center justify-center shadow-lg shadow-violet-900/50">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-[22px] font-bold text-white tracking-tight leading-tight">
                {heading}
              </h2>
              <p className="mt-1.5 text-[13px] text-white/35 font-light">
                {subheading}
              </p>
            </div>

            {/* Tab toggle (only for non-forgot-password) */}
            {!isForgotPassword && (
              <div className="relative mb-7 flex rounded-xl border border-white/7 bg-white/3 p-1 gap-1">
                {/* Sliding pill indicator */}
                <motion.div
                  layoutId="tab-pill"
                  className="absolute top-1 bottom-1 rounded-lg bg-linear-to-r from-violet-600/50 to-indigo-600/40 border border-violet-400/20 shadow-lg shadow-violet-900/30"
                  style={{
                    width: "calc(50% - 6px)",
                    left: activeTab === "login" ? "4px" : "calc(50% + 2px)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
                {(["login", "register"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => switchTab(tab)}
                    className={`relative z-10 flex-1 py-2 text-[13px] font-semibold rounded-lg transition-colors duration-200 ${activeTab === tab ? "text-white" : "text-white/35 hover:text-white/60"
                      }`}
                  >
                    {tab === "login" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>
            )}

            {/* Form area */}
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
                  <FloatingInput
                    id="fp-email"
                    type="email"
                    label="Email Address"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    icon={Mail}
                  />

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
                    >
                      {error}
                    </motion.div>
                  )}
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-[13px] text-emerald-300"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {successMessage}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setError(""); setSuccessMessage(""); }}
                      className="text-[13px] text-white/35 hover:text-white/70 transition-colors font-medium"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
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
                    id="login-email"
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
                      <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                        <Lock className="h-3 w-3" /> Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => { setIsForgotPassword(true); setError(""); setSuccessMessage(""); }}
                        className="text-[11px] text-violet-400/80 hover:text-violet-300 transition-colors font-medium"
                      >
                        Forgot password?
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

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
                    >
                      {error}
                    </motion.div>
                  )}
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-[13px] text-emerald-300"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {successMessage}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_100%] hover:bg-[100%_0] transition-[background-position] duration-500 ease-in-out text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
                    id="reg-name"
                    label="Full Name"
                    placeholder="Arjun Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    icon={User}
                  />
                  <FloatingInput
                    id="reg-email"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    icon={Mail}
                  />
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/35">
                      <KeyRound className="h-3 w-3" /> Password
                    </Label>
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
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_100%] hover:bg-[100%_0] transition-[background-position] duration-500 ease-in-out text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Google OAuth section — only for login/register */}
            {!isForgotPassword && (
              <>
                {/* Divider */}
                <div className="relative my-6 flex items-center">
                  <div className="flex-1 border-t border-white/8" />
                  <span className="mx-4 shrink-0 rounded-full border border-white/8 bg-white/3 px-3 py-1 text-[11px] uppercase tracking-widest text-white/25">
                    or continue with
                  </span>
                  <div className="flex-1 border-t border-white/8" />
                </div>

                {/* Google button wrapper */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => performGoogleLogin()}
                    className="relative w-full h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-3 text-[14px] font-medium text-white group"
                  >
                    {/* Google G Icon */}
                    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                {/* Footer text */}
                <p className="mt-5 text-center text-[11px] text-white/20 leading-relaxed">
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
      </DialogContent>
    </Dialog>
  );
}
