import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWeekKey } from "@/utils/weekKeys";

interface SleepAverageState {
  hoursByWeek: Record<string, number>;
  getHoursForWeek: (weekKey?: string) => number | null;
  setHoursForWeek: (weekKey: string, hours: number) => void;
  clearWeek: (weekKey: string) => void;
}

export const useSleepAverageStore = create<SleepAverageState>()(
  persist(
    (set, get) => ({
      hoursByWeek: {},
      getHoursForWeek: (weekKey) => {
        const key = weekKey ?? getWeekKey();
        const value = get().hoursByWeek[key];
        return value == null ? null : value;
      },
      setHoursForWeek: (weekKey, hours) =>
        set((state) => ({
          hoursByWeek: {
            ...state.hoursByWeek,
            [weekKey]: Math.max(0, Math.min(24, hours)),
          },
        })),
      clearWeek: (weekKey) =>
        set((state) => {
          const next = { ...state.hoursByWeek };
          delete next[weekKey];
          return { hoursByWeek: next };
        }),
    }),
    {
      name: "sleep-average-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hoursByWeek: state.hoursByWeek }),
    }
  )
);
