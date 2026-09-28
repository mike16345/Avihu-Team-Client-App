import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWeekKey } from "@/utils/weekKeys";

interface WeeklyFeedbackState {
  textByWeek: Record<string, string>;
  getTextForWeek: (weekKey?: string) => string;
  setTextForWeek: (weekKey: string, text: string) => void;
  clearWeek: (weekKey: string) => void;
}

export const useWeeklyFeedbackStore = create<WeeklyFeedbackState>()(
  persist(
    (set, get) => ({
      textByWeek: {},
      getTextForWeek: (weekKey) => {
        const key = weekKey ?? getWeekKey();
        return get().textByWeek[key] ?? "";
      },
      setTextForWeek: (weekKey, text) =>
        set((state) => {
          const next = { ...state.textByWeek };
          if (text.trim().length === 0) delete next[weekKey];
          else next[weekKey] = text;
          return { textByWeek: next };
        }),
      clearWeek: (weekKey) =>
        set((state) => {
          const next = { ...state.textByWeek };
          delete next[weekKey];
          return { textByWeek: next };
        }),
    }),
    {
      name: "weekly-feedback-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ textByWeek: state.textByWeek }),
    }
  )
);
