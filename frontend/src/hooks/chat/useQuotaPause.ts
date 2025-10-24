import { useEffect, useMemo, useRef } from "react";
import useChatStorage from "@/hooks/sessions/useChatStorage";

export interface StatusBannerState {
  variant: "quota" | "paused";
  message: string;
}

const useQuotaPause = (sessionId?: string) => {
  const { meta, setSessionQuota } = useChatStorage();

  const quotaState = meta.quota;
  const pausedState = meta.paused;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!sessionId || !quotaState?.active || !quotaState.resetAt) {
      return;
    }

    const resetDate = new Date(quotaState.resetAt);
    const resetTime = resetDate.getTime();

    if (Number.isNaN(resetTime)) {
      void setSessionQuota(sessionId, null);
      return;
    }

    const now = Date.now();

    if (now >= resetTime) {
      void setSessionQuota(sessionId, null);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      void setSessionQuota(sessionId, null);
      timeoutRef.current = null;
    }, resetTime - now);
  }, [quotaState?.active, quotaState?.resetAt, sessionId, setSessionQuota]);

  const isQuotaActive = useMemo(() => {
    if (!quotaState?.active || !quotaState.resetAt) return false;

    const resetDate = new Date(quotaState.resetAt);
    if (Number.isNaN(resetDate.getTime())) return false;

    return Date.now() < resetDate.getTime();
  }, [quotaState?.active, quotaState?.resetAt]);

  const quotaResetLabel = useMemo(() => {
    if (!quotaState?.resetAt) return "";

    const resetDate = new Date(quotaState.resetAt);
    if (Number.isNaN(resetDate.getTime())) return "";

    const now = new Date();
    const isSameDay = resetDate.toDateString() === now.toDateString();

    if (isSameDay) {
      return resetDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return resetDate.toLocaleString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [quotaState?.resetAt]);

  const quotaBannerMessage = useMemo(() => {
    if (!isQuotaActive || !quotaState) return null;

    return `הגעת למכסה היומית שלך (${quotaState.limit} שאלות). תוכל לנסות שוב אחרי ${quotaResetLabel}.\nDaily question limit reached (${quotaState.limit}). Try again after ${quotaResetLabel}.`;
  }, [isQuotaActive, quotaResetLabel, quotaState]);

  const statusBanner = useMemo<StatusBannerState | null>(() => {
    if (quotaBannerMessage) {
      return { variant: "quota", message: quotaBannerMessage };
    }

    if (pausedState?.active && pausedState.message) {
      return { variant: "paused", message: pausedState.message };
    }

    return null;
  }, [pausedState?.active, pausedState?.message, quotaBannerMessage]);

  const isComposerLocked = isQuotaActive || !!pausedState?.active;

  return {
    statusBanner,
    isComposerLocked,
  };
};

export default useQuotaPause;
