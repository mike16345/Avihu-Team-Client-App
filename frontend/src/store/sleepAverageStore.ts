import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getWeekKey = (now: Date = new Date()): string => {
  const d = new Date(now);
  const day = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

interface SleepAverageState {
  hours: number | null;
  weekKey: string;
  setHours: (hours: number) => void;
  resetIfNewWeek: () => void;
  clear: () => void;
}

export const useSleepAverageStore = create<SleepAverageState>()(
  persist(
    (set, get) => ({
      hours: null,
      weekKey: getWeekKey(),
      setHours: (hours) =>
        set({
          hours: Math.max(0, Math.min(24, hours)),
          weekKey: getWeekKey(),
        }),
      resetIfNewWeek: () => {
        const nowKey = getWeekKey();
        if (nowKey !== get().weekKey) set({ hours: null, weekKey: nowKey });
      },
      clear: () => set({ hours: null, weekKey: getWeekKey() }),
    }),
    {
      name: "sleep-average-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hours: state.hours, weekKey: state.weekKey }),
    }
  )
);
