"use client";

import { useState, useEffect, useCallback } from "react";

export const GUEST_CHAT_LIMIT = 10;
const STORAGE_KEY = "guest_chat_count";
const GUEST_MESSAGES_KEY = "guest_chat_messages";

export interface GuestMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: string; // ISO string for JSON serialization
}

export function useGuestChatLimit(isLoggedIn: boolean) {
  const [guestCount, setGuestCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    setGuestCount(isNaN(stored) ? 0 : stored);
    setIsHydrated(true);
  }, []);

  const remainingMessages = Math.max(0, GUEST_CHAT_LIMIT - guestCount);
  const isLimitReached = guestCount >= GUEST_CHAT_LIMIT;
  const isNearLimit = remainingMessages <= 3 && remainingMessages > 0;

  /**
   * Called after a SUCCESSFUL user message+response pair.
   * Returns false if limit is already reached (should show modal instead).
   */
  const incrementCount = useCallback((): boolean => {
    if (isLoggedIn) return true; // No limit for logged-in users

    const current = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    if (current >= GUEST_CHAT_LIMIT) {
      setShowLimitModal(true);
      return false;
    }
    const next = current + 1;
    localStorage.setItem(STORAGE_KEY, String(next));
    setGuestCount(next);

    if (next >= GUEST_CHAT_LIMIT) {
      // Show modal after the last allowed message is displayed
      // (let the message render first, then show modal on next attempt)
    }
    return true;
  }, [isLoggedIn]);

  /**
   * Check before sending — if limit is reached, show modal and return false.
   */
  const checkLimit = useCallback((): boolean => {
    if (isLoggedIn) return true;
    const current = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    if (current >= GUEST_CHAT_LIMIT) {
      setShowLimitModal(true);
      return false;
    }
    return true;
  }, [isLoggedIn]);

  /**
   * Persist guest messages to localStorage for post-login sync.
   */
  const saveGuestMessages = useCallback(
    (messages: GuestMessage[]) => {
      if (isLoggedIn) return;
      try {
        localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(messages));
      } catch {
        // localStorage might be full
      }
    },
    [isLoggedIn]
  );

  /**
   * Load persisted guest messages (called after login to sync).
   */
  const loadGuestMessages = useCallback((): GuestMessage[] => {
    try {
      const raw = localStorage.getItem(GUEST_MESSAGES_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as GuestMessage[];
    } catch {
      return [];
    }
  }, []);

  /**
   * Clear all guest data after successful sync.
   */
  const clearGuestData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(GUEST_MESSAGES_KEY);
    setGuestCount(0);
  }, []);

  const dismissModal = useCallback(() => setShowLimitModal(false), []);
  const openModal = useCallback(() => setShowLimitModal(true), []);

  return {
    guestCount,
    remainingMessages,
    isLimitReached,
    isNearLimit,
    showLimitModal,
    isHydrated,
    checkLimit,
    incrementCount,
    saveGuestMessages,
    loadGuestMessages,
    clearGuestData,
    dismissModal,
    openModal,
  };
}
