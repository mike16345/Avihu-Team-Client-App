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

interface WeeklyFeedbackState {
  text: string;
  weekKey: string;
  setText: (text: string) => void;
  resetIfNewWeek: () => void;
  clear: () => void;
}

export const useWeeklyFeedbackStore = create<WeeklyFeedbackState>()(
  persist(
    (set, get) => ({
      text: "",
      weekKey: getWeekKey(),
      setText: (text) => set({ text, weekKey: getWeekKey() }),
      resetIfNewWeek: () => {
        const nowKey = getWeekKey();
        if (nowKey !== get().weekKey) set({ text: "", weekKey: nowKey });
      },
      clear: () => set({ text: "", weekKey: getWeekKey() }),
    }),
    {
      name: "weekly-feedback-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ text: state.text, weekKey: state.weekKey }),
    }
  )
);
