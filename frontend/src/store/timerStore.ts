import { create } from "zustand";
import * as Haptic from "expo-haptics";
import useNotification from "@/hooks/useNotfication";

interface ITimerStore {
  countdown: number | null;
  initialCountdown: number;
  intervalId: NodeJS.Timeout | null;
  startTime: number | null;
  notificationIdentifier: string | null;
  startCountdown: (seconds: number) => void;
  stopCountdown: () => void;
  setCountdown: (seconds: number | null) => void;
}

const { showNotification, cancelNotification } = useNotification();

export const useTimerStore = create<ITimerStore>((set, get) => ({
  countdown: null,
  initialCountdown: 0,
  intervalId: null,
  startTime: null,
  notificationIdentifier: null,

  startCountdown: async (seconds: number) => {
    const startTime = Date.now();
    set({ countdown: seconds, initialCountdown: seconds, startTime });

    const identifier = await showNotification(`זמן מנוחה נגמר – מתחילים את הסט הבא!`, seconds);

    set({ notificationIdentifier: identifier });

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
    const { intervalId, notificationIdentifier } = get();

    if (intervalId) clearInterval(intervalId);

    if (notificationIdentifier) cancelNotification(notificationIdentifier);

    set({
      countdown: null,
      intervalId: null,
      initialCountdown: 0,
      startTime: null,
      notificationIdentifier: null,
    });
  },

  setCountdown: (seconds: number | null) => {
    const { stopCountdown, startCountdown } = get();
    stopCountdown();
    if (seconds !== null) {
      startCountdown(seconds);
    }
  },
}));
