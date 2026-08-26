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

interface CardioMinutesState {
  minutes: number | null;
  weekKey: string;
  setMinutes: (minutes: number) => void;
  resetIfNewWeek: () => void;
}

export const useCardioMinutesStore = create<CardioMinutesState>()(
  persist(
    (set, get) => ({
      minutes: null,
      weekKey: getWeekKey(),
      setMinutes: (minutes) => set({ minutes, weekKey: getWeekKey() }),
      resetIfNewWeek: () => {
        const nowKey = getWeekKey();
        if (nowKey !== get().weekKey) set({ minutes: null, weekKey: nowKey });
      },
    }),
    {
      name: "cardio-minutes-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ minutes: state.minutes, weekKey: state.weekKey }),
    }
  )
);
