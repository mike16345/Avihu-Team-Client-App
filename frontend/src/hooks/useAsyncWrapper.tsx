import { useState } from "react";
import { useToast } from "./useToast";

export const useAsyncWrapper = (toastDuration = 5000) => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const { triggerErrorToast, triggerSuccessToast } = useToast();

  const run = async (fn: () => Promise<void>, messages: { success: string; error?: string }) => {
    setLoading(true);
    try {
      await fn();
      setVisible(false);
      triggerSuccessToast({ message: messages?.success, duration: toastDuration });
    } catch (e: any) {
      setVisible(false);
      triggerErrorToast({
        message: messages?.error || e?.message || "An error occurred",
        duration: toastDuration,
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setVisible(true);
      }, toastDuration);
    }
  };

  return { loading, run, visible };
};
