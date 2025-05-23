import { create } from "zustand";
import * as Haptic from "expo-haptics";
import useNotification from "@/hooks/useNotfication";

interface ITimerStore {
  countdown: number | null;
  initialCountdown: number;
  intervalId: NodeJS.Timeout | null;
  startTime: number | null;
  startCountdown: (seconds: number) => void;
  stopCountdown: () => void;
  setCountdown: (seconds: number | null) => void;
}

const { showNotification } = useNotification();

export const useTimerStore = create<ITimerStore>((set, get) => ({
  countdown: null,
  initialCountdown: 0,
  intervalId: null,
  startTime: null,

  startCountdown: (seconds: number) => {
    const startTime = Date.now();
    set({ countdown: seconds, initialCountdown: seconds, startTime });

    showNotification(`זמן מנוחה נגמר – מתחילים את הסט הבא!`, seconds);

    const interval = setInterval(() => {
      const state = get();
      const elapsedSeconds = Math.floor((Date.now() - state.startTime!) / 1000);
      const remaining = Math.max(state.initialCountdown! - elapsedSeconds, 0);

      if (remaining >= 8 && remaining <= 10) {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
      } else if (remaining >= 5 && remaining <= 7) {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
      } else if (remaining >= 1 && remaining <= 4) {
        Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);
      }

      if (remaining === 0) {
        Haptic.notificationAsync(Haptic.NotificationFeedbackType.Error);

        clearInterval(state.intervalId!);

        set({ countdown: 0, intervalId: null });
      } else {
        set({ countdown: remaining });
      }
    }, 1000);

    set({ intervalId: interval });
  },

  stopCountdown: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ countdown: null, intervalId: null, initialCountdown: 0, startTime: null });
  },

  setCountdown: (seconds: number | null) => {
    const { stopCountdown, startCountdown } = get();
    stopCountdown();
    if (seconds !== null) {
      startCountdown(seconds);
    }
  },
}));
