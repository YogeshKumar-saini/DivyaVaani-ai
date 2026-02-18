"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, ChevronRight } from "lucide-react";
import { GUEST_CHAT_LIMIT } from "@/lib/hooks/useGuestChatLimit";

interface GuestMessageBannerProps {
  remainingMessages: number;
  isNearLimit: boolean;
  isLimitReached: boolean;
  onUpgradeClick: () => void;
  className?: string;
}

export function GuestMessageBanner({
  remainingMessages,
  isNearLimit,
  isLimitReached,
  onUpgradeClick,
  className = "",
}: GuestMessageBannerProps) {
  // Don't render when logged in or no near-limit condition
  if (!isNearLimit && !isLimitReached) return null;

  const usedMessages = GUEST_CHAT_LIMIT - remainingMessages;
  const progressPct = Math.min((usedMessages / GUEST_CHAT_LIMIT) * 100, 100);

  if (isLimitReached) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`w-full max-w-3xl mx-auto ${className}`}
        >
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/25 bg-gradient-to-r from-rose-950/60 via-slate-900/80 to-violet-950/60 backdrop-blur-xl shadow-lg shadow-rose-900/20">
            {/* Shimmer top line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />

            <div className="flex items-center gap-4 px-5 py-4">
              {/* Icon */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
                  <Lock className="h-4.5 w-4.5 text-rose-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-400 animate-ping opacity-50" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-white leading-tight">
                  You&apos;ve used all {GUEST_CHAT_LIMIT} free messages
                </div>
                <div className="text-[12px] text-white/40 mt-0.5">
                  Sign up free to continue — your conversation will be saved
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={onUpgradeClick}
                className="group shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-[13px] shadow-lg shadow-violet-900/40 transition-all duration-200 whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Get Free Access
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Near limit: subtle animated banner
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`w-full max-w-3xl mx-auto ${className}`}
      >
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-violet-950/30 backdrop-blur-xl">
          {/* Shimmer */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          <div className="px-5 py-3.5">
            <div className="flex items-center justify-between gap-4 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[12px] font-medium text-amber-300/80">
                  {remainingMessages} free message{remainingMessages !== 1 ? "s" : ""} remaining
                </span>
              </div>
              <button
                onClick={onUpgradeClick}
                className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                Sign up free
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-amber-400 to-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[10px] text-white/20">{usedMessages} used</span>
              <span className="text-[10px] text-white/20">{GUEST_CHAT_LIMIT} total</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
