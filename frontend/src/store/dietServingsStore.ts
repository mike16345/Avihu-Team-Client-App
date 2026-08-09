import { create } from "zustand";

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

export const useDietServingsStore = create<DietServingsState>((set, get) => ({
  ...emptyDay(),
  currentDayKey: getLogicalDayKey(),
  bump: (key, delta) =>
    set((state) => ({ ...state, [key]: Math.max(0, round2(state[key] + delta)) })),
  setValue: (key, value) =>
    set((state) => ({ ...state, [key]: Math.max(0, round2(value)) })),
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
}));
