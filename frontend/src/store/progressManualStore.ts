import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWeekKey, getDayKey, getWeekDayKeys } from "@/utils/weekKeys";

export { getDayKey } from "@/utils/weekKeys";

interface ProgressManualState {
  workoutMarks: Record<string, boolean>;
  nutritionMarks: Record<string, boolean>;
  weekKey: string;
  dayKey: string;
  isWorkoutMarkedForWeek: (planId: string, weekKey: string) => boolean;
  toggleWorkoutMarkForWeek: (planId: string, weekKey: string) => void;
  toggleNutritionMarkForDay: (dayKey: string) => void;
  resetIfNewPeriod: () => void;
}

export const useProgressManualStore = create<ProgressManualState>()(
  persist(
    (set, get) => ({
      workoutMarks: {},
      nutritionMarks: {},
      weekKey: getWeekKey(),
      dayKey: getDayKey(),
      isWorkoutMarkedForWeek: (planId, weekKey) =>
        !!get().workoutMarks[`${weekKey}::${planId}`],
      toggleWorkoutMarkForWeek: (planId, weekKey) =>
        set((state) => {
          const key = `${weekKey}::${planId}`;
          const next = { ...state.workoutMarks };
          if (next[key]) delete next[key];
          else next[key] = true;
          return { workoutMarks: next };
        }),
      toggleNutritionMarkForDay: (dayKey) =>
        set((state) => {
          const next = { ...state.nutritionMarks };
          if (next[dayKey]) delete next[dayKey];
          else next[dayKey] = true;
          return { nutritionMarks: next };
        }),
      resetIfNewPeriod: () => {
        const nowWeek = getWeekKey();
        const nowDay = getDayKey();
        const state = get();
        const patch: Partial<ProgressManualState> = {};
        if (nowWeek !== state.weekKey) patch.weekKey = nowWeek;
        if (nowDay !== state.dayKey) patch.dayKey = nowDay;
        if (Object.keys(patch).length > 0) set(patch as ProgressManualState);
      },
    }),
    {
      name: "progress-manual-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        workoutMarks: state.workoutMarks,
        nutritionMarks: state.nutritionMarks,
        weekKey: state.weekKey,
        dayKey: state.dayKey,
      }),
    }
  )
);

export const getPreviousWeekDayKeys = (previousWeekKey: string): string[] =>
  getWeekDayKeys(previousWeekKey);
