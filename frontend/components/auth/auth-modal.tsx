"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/auth-provider";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { authService } from "@/lib/api/auth-service";

interface AuthModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: "login" | "register";
}

export function AuthModal({ isOpen, onOpenChange, defaultTab = "login" }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const { login, googleLogin, register } = useAuth();

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setFullName("");
        setError("");
        setSuccessMessage("");
        setIsLoading(false);
        setIsForgotPassword(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await login({ email, password });
            onOpenChange(false);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed");
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
            setActiveTab("login");
            setSuccessMessage("Account created! Please log in.");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Registration failed");
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
            setSuccessMessage("Reset link sent! Check your email.");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to send reset link");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            onOpenChange(open);
        }}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-black/60 backdrop-blur-2xl border-white/10 text-white shadow-2xl rounded-3xl">
                <GrainOverlay />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-orange-500/20 pointer-events-none" />

                {/* Animated Orbs */}
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-500/30 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-orange-500/30 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

                <div className="relative p-8 z-10">
                    <DialogHeader className="mb-8 text-center space-y-3">
                        <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70 tracking-tight">
                            {isForgotPassword ? "Reset Password" : (activeTab === "login" ? "Welcome Back" : "Join DivyaVaani")}
                        </DialogTitle>
                        <DialogDescription className="text-white/60 text-base font-medium">
                            {isForgotPassword
                                ? "Enter your email to receive a reset link"
                                : (activeTab === "login" ? "Enter your credentials to access your account" : "Start your journey with us today")}
                        </DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        {isForgotPassword ? (
                            <motion.div
                                key="forgot-password"
                                initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <form onSubmit={handleForgotPassword} className="space-y-6">
                                    <EnhancedInput
                                        id="fp-email"
                                        type="email"
                                        label="Email Address"
                                        placeholder="m@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-4"
                                    />

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                    {successMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-green-300 bg-green-500/10 p-3 rounded-xl border border-green-500/20 flex items-center gap-2"
                                        >
                                            <CheckCircle2 className="h-4 w-4" /> {successMessage}
                                        </motion.div>
                                    )}

                                    <EnhancedButton
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0 h-12 rounded-xl font-semibold shadow-lg shadow-orange-500/20"
                                        disabled={isLoading}
                                        glow
                                        ripple
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send Reset Link"}
                                    </EnhancedButton>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(false)}
                                            className="text-sm text-white/50 hover:text-white transition-colors font-medium"
                                        >
                                            Back to Login
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="auth-tabs"
                                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 border border-white/10 rounded-xl p-1">
                                        <TabsTrigger
                                            value="login"
                                            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 rounded-lg transition-all duration-300"
                                        >
                                            Login
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="register"
                                            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 rounded-lg transition-all duration-300"
                                        >
                                            Sign Up
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="login" className="mt-0">
                                        <form onSubmit={handleLogin} className="space-y-5">
                                            <EnhancedInput
                                                id="email"
                                                type="email"
                                                label="Email"
                                                placeholder="m@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password" className="text-white/80 hidden">Password</Label>
                                                </div>
                                                <EnhancedInput
                                                    id="password"
                                                    type="password"
                                                    label="Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsForgotPassword(true)}
                                                        className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium"
                                                    >
                                                        Forgot password?
                                                    </button>
                                                </div>
                                            </div>

                                            {error && <div className="text-sm text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
                                            {successMessage && <div className="text-sm text-green-300 bg-green-500/10 p-3 rounded-xl border border-green-500/20 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {successMessage}</div>}

                                            <EnhancedButton
                                                type="submit"
                                                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0 h-12 rounded-xl font-semibold shadow-lg shadow-orange-500/20"
                                                disabled={isLoading}
                                                glow
                                                ripple
                                                magneticEffect
                                            >
                                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                                                    <span className="flex items-center justify-center w-full">Login <ArrowRight className="ml-2 h-4 w-4" /></span>
                                                )}
                                            </EnhancedButton>
                                        </form>
                                    </TabsContent>

                                    <TabsContent value="register" className="mt-0">
                                        <form onSubmit={handleRegister} className="space-y-4">
                                            <EnhancedInput
                                                id="fullName"
                                                label="Full Name"
                                                placeholder="John Doe"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                            <EnhancedInput
                                                id="reg-email"
                                                type="email"
                                                label="Email"
                                                placeholder="m@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                            <EnhancedInput
                                                id="reg-password"
                                                type="password"
                                                label="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />

                                            {error && <div className="text-sm text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}

                                            <EnhancedButton
                                                type="submit"
                                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0 h-12 rounded-xl font-semibold shadow-lg shadow-purple-500/20"
                                                disabled={isLoading}
                                                glow
                                                ripple
                                            >
                                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
                                            </EnhancedButton>
                                        </form>
                                    </TabsContent>
                                </Tabs>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-black/50 backdrop-blur-md px-4 text-white/40 rounded-full border border-white/5">Or continue with</span>
                                    </div>
                                </div>

                                <div className="w-full flex justify-center">
                                    <div style={{ width: '100%' }} className="transform hover:scale-[1.02] transition-transform duration-300">
                                        <GoogleLogin
                                            onSuccess={async (credentialResponse) => {
                                                if (credentialResponse.credential) {
                                                    try {
                                                        await googleLogin(credentialResponse.credential)
                                                        onOpenChange(false);
                                                    } catch (e) {
                                                        console.error("Google login failed", e);
                                                        setError("Google login failed");
                                                    }
                                                }
                                            }}
                                            onError={() => {
                                                console.log('Login Failed');
                                                setError("Google login failed");
                                            }}
                                            theme="filled_black"
                                            shape="pill"
                                            size="large"
                                            width="380" // Matched to container padding
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
