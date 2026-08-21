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

export const getDayKey = (now: Date = new Date()): string => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

interface ProgressManualState {
  workoutMarks: Record<string, boolean>;
  nutritionMarks: Record<string, boolean>;
  weekKey: string;
  dayKey: string;
  isWorkoutMarked: (planId: string) => boolean;
  toggleWorkoutMark: (planId: string) => void;
  isNutritionMarkedToday: () => boolean;
  toggleNutritionMarkToday: () => void;
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
      isWorkoutMarked: (planId) => !!get().workoutMarks[`${get().weekKey}::${planId}`],
      toggleWorkoutMark: (planId) =>
        set((state) => {
          const key = `${state.weekKey}::${planId}`;
          const next = { ...state.workoutMarks };
          if (next[key]) delete next[key];
          else next[key] = true;
          return { workoutMarks: next };
        }),
      isNutritionMarkedToday: () => !!get().nutritionMarks[get().dayKey],
      toggleNutritionMarkToday: () =>
        set((state) => {
          const key = state.dayKey;
          const next = { ...state.nutritionMarks };
          if (next[key]) delete next[key];
          else next[key] = true;
          return { nutritionMarks: next };
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
        if (nowWeek !== state.weekKey) {
          patch.workoutMarks = {};
          patch.nutritionMarks = {};
          patch.weekKey = nowWeek;
        }
        if (nowDay !== state.dayKey) {
          patch.dayKey = nowDay;
        }
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
