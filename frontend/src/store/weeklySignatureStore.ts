import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getWeekKeyForDate = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export const getCurrentWeekKey = (): string => getWeekKeyForDate(new Date());

export const getPreviousWeekKey = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return getWeekKeyForDate(d);
};

interface WeeklySignatureState {
  finalizedWeeks: Record<string, string>;
  isFinalized: (weekKey: string) => boolean;
  finalize: (weekKey: string) => void;
}

export const useWeeklySignatureStore = create<WeeklySignatureState>()(
  persist(
    (set, get) => ({
      finalizedWeeks: {},
      isFinalized: (weekKey) => !!get().finalizedWeeks[weekKey],
      finalize: (weekKey) =>
        set((state) => ({
          finalizedWeeks: { ...state.finalizedWeeks, [weekKey]: new Date().toISOString() },
        })),
    }),
    {
      name: "weekly-signature-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ finalizedWeeks: state.finalizedWeeks }),
    }
  )
);
