import { create } from "zustand";
import * as Haptic from "expo-haptics";
import useNotification from "@/hooks/useNotfication";

interface ITimerStore {
  countdown: number | null;
  initialCountdown: number;
  intervalId: NodeJS.Timeout | null;
  startCountdown: (seconds: number) => void;
  stopCountdown: () => void;
  setCountdown: (seconds: number | null) => void;
}

const { showNotification } = useNotification();

export const useTimerStore = create<ITimerStore>((set, get) => ({
  countdown: null,
  initialCountdown: 0,
  intervalId: null,

  startCountdown: (seconds: number) => {
    // Set countdown values
    set({ countdown: seconds, initialCountdown: seconds });

    const interval = setInterval(() => {
      set((state) => {
        if (state.countdown && state.countdown > 1) {
          if (state.countdown >= 8 && state.countdown <= 10) {
            Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
          } else if (state.countdown >= 5 && state.countdown <= 7) {
            Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
          } else if (state.countdown >= 1 && state.countdown <= 4) {
            Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);
          }

          return { countdown: state.countdown - 1 };
        } else {
          Haptic.notificationAsync(Haptic.NotificationFeedbackType.Error);
          showNotification(`זמן מנוחה נגמר – מתחילים את הסט הבא!`);
          clearInterval(get().intervalId!);
          return { countdown: 0, intervalId: null };
        }
      });
    }, 1000);

    // Save new interval ID
    set({ intervalId: interval });
  },

  stopCountdown: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ countdown: null, intervalId: null, initialCountdown: 0 });
  },

  setCountdown: (seconds: number | null) => {
    const { stopCountdown, startCountdown } = get();
    stopCountdown();
    if (seconds !== null) {
      startCountdown(seconds);
    }
  },
}));
