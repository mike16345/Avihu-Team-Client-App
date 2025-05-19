import { create } from "zustand";

interface ITimerStore {
  countdown: number | null;
  initialCountdown: number;
  intervalId: NodeJS.Timeout | null;
  startCountdown: (seconds: number) => void;
  stopCountdown: () => void;
  setCountdown: (seconds: number | null) => void;
}

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
          return { countdown: state.countdown - 1 };
        } else {
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
