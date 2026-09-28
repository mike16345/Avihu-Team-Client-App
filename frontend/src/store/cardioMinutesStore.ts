import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWeekKey } from "@/utils/weekKeys";

interface CardioMinutesState {
  minutesByWeek: Record<string, number>;
  getMinutesForWeek: (weekKey?: string) => number | null;
  setMinutesForWeek: (weekKey: string, minutes: number) => void;
  clearWeek: (weekKey: string) => void;
}

export const useCardioMinutesStore = create<CardioMinutesState>()(
  persist(
    (set, get) => ({
      minutesByWeek: {},
      getMinutesForWeek: (weekKey) => {
        const key = weekKey ?? getWeekKey();
        const value = get().minutesByWeek[key];
        return value == null ? null : value;
      },
      setMinutesForWeek: (weekKey, minutes) =>
        set((state) => ({
          minutesByWeek: {
            ...state.minutesByWeek,
            [weekKey]: Math.max(0, minutes),
          },
        })),
      clearWeek: (weekKey) =>
        set((state) => {
          const next = { ...state.minutesByWeek };
          delete next[weekKey];
          return { minutesByWeek: next };
        }),
    }),
    {
      name: "cardio-minutes-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ minutesByWeek: state.minutesByWeek }),
    }
  )
);
