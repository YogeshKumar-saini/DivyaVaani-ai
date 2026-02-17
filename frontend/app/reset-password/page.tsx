"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/api/auth-service";
import { Suspense } from 'react';
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!token) {
            setError("Missing token");
            return;
        }

        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            await authService.resetPassword(token, password);
            setMessage("Password successfully reset! Redirecting to login...");
            setTimeout(() => {
                router.push("/"); // Redirect to home, user can then open login modal
            }, 3000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl max-w-md w-full text-center">
                    <p className="text-red-400 mb-4 bg-red-500/10 p-2 rounded">Invalid or missing reset token.</p>
                    <Link href="/" className="text-orange-400 hover:text-orange-300 underline">
                        Return to Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10 p-6"
            >
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-orange-500/10 pointer-events-none" />

                    <div className="relative p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-2">Reset Password</h1>
                            <p className="text-white/50 text-sm">Create a new secure password for your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-white/80">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-orange-500/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-orange-500/20"
                                    />
                                </div>
                            </div>

                            {error && <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</div>}
                            {message && <div className="text-sm text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {message}</div>}

                            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-none shadow-lg shadow-orange-500/20" disabled={isLoading || !!message}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
                            </Button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
