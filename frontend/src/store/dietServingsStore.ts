import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ServingKey = "protein" | "carbs" | "fat" | "free" | "veg";

interface DietServingsState {
  protein: number;
  carbs: number;
  fat: number;
  free: number;
  veg: number;
  eatenCategories: Record<string, boolean>;
  currentDayKey: string;
  bump: (key: ServingKey, delta: number) => void;
  setValue: (key: ServingKey, value: number) => void;
  toggleMealCategory: (mealId: string, key: ServingKey, quantity: number) => void;
  isCategoryEaten: (mealId: string, key: ServingKey) => boolean;
  resetIfNewDay: () => void;
  reset: () => void;
  reconcileEaten: () => void;
  reconcileWithTargets: (targets: Partial<Record<ServingKey, number>>) => void;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;
const mealCatKey = (mealId: string, key: ServingKey) => `${mealId}::${key}`;

const DAY_START_HOUR = 3;

export const getLogicalDayKey = (now = new Date()): string => {
  const shifted = new Date(now.getTime() - DAY_START_HOUR * 60 * 60 * 1000);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, "0");
  const d = String(shifted.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const emptyDay = () => ({
  protein: 0,
  carbs: 0,
  fat: 0,
  free: 0,
  veg: 0,
  eatenCategories: {},
});

export const useDietServingsStore = create<DietServingsState>()(
  persist(
    (set, get) => ({
      ...emptyDay(),
      currentDayKey: getLogicalDayKey(),
      bump: (key, delta) =>
        set((state) => ({ ...state, [key]: Math.max(0, round2(state[key] + delta)) })),
      setValue: (key, value) =>
        set((state) => {
          const suffix = `::${key}`;
          const clearedEaten = Object.fromEntries(
            Object.entries(state.eatenCategories).filter(([k]) => !k.endsWith(suffix))
          );
          return {
            ...state,
            [key]: Math.max(0, round2(value)),
            eatenCategories: clearedEaten,
          };
        }),
      toggleMealCategory: (mealId, key, quantity) =>
        set((state) => {
          const k = mealCatKey(mealId, key);
          const wasEaten = !!state.eatenCategories[k];
          const delta = wasEaten ? -quantity : quantity;
          return {
            ...state,
            [key]: Math.max(0, round2(state[key] + delta)),
            eatenCategories: { ...state.eatenCategories, [k]: !wasEaten },
          };
        }),
      isCategoryEaten: (mealId, key) => !!get().eatenCategories[mealCatKey(mealId, key)],
      resetIfNewDay: () => {
        const nowKey = getLogicalDayKey();
        if (nowKey !== get().currentDayKey) {
          set({ ...emptyDay(), currentDayKey: nowKey });
        }
      },
      reset: () => set({ ...emptyDay(), currentDayKey: getLogicalDayKey() }),
      reconcileEaten: () =>
        set((state) => {
          const zeroKeys = new Set<string>();
          (["protein", "carbs", "fat", "veg"] as ServingKey[]).forEach((k) => {
            if ((state[k] as number) <= 0) zeroKeys.add(`::${k}`);
          });
          if (zeroKeys.size === 0) return state;
          const filtered = Object.fromEntries(
            Object.entries(state.eatenCategories).filter(
              ([k]) => ![...zeroKeys].some((suffix) => k.endsWith(suffix))
            )
          );
          if (Object.keys(filtered).length === Object.keys(state.eatenCategories).length) return state;
          return { ...state, eatenCategories: filtered };
        }),
      reconcileWithTargets: (targets) =>
        set((state) => {
          const keys: ServingKey[] = ["protein", "carbs", "fat", "veg", "free"];
          const patch: Partial<DietServingsState> = {};
          const suffixesToStrip: string[] = [];
          keys.forEach((k) => {
            const target = targets[k];
            if (target != null && target <= 0 && (state[k] as number) > 0) {
              (patch as any)[k] = 0;
              suffixesToStrip.push(`::${k}`);
            }
          });
          const patchedKeys = Object.keys(patch);
          if (patchedKeys.length === 0) return state;
          const filtered = Object.fromEntries(
            Object.entries(state.eatenCategories).filter(
              ([k]) => !suffixesToStrip.some((suffix) => k.endsWith(suffix))
            )
          );
          return { ...state, ...patch, eatenCategories: filtered };
        }),
    }),
    {
      name: "diet-servings-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        protein: state.protein,
        carbs: state.carbs,
        fat: state.fat,
        free: state.free,
        veg: state.veg,
        eatenCategories: state.eatenCategories,
        currentDayKey: state.currentDayKey,
      }),
    }
  )
);
