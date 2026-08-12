import type { DietV2Meal, IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import type { DietPlanV2Totals } from "./dietPlanV2Utils";

export interface DietPlanV2MealCompletion {
  selectedRows: string[];
  completed: boolean;
}

export type DietPlanV2CompletionMap = Record<string, DietPlanV2MealCompletion>;

const DAY_START_HOUR = 3;

export const getDietPlanV2DayKey = (now = new Date()): string => {
  const shifted = new Date(now.getTime() - DAY_START_HOUR * 60 * 60 * 1000);
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, "0");
  const day = String(shifted.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDietPlanV2ContextKey = (plan: IDietPlanV2): string => {
  if (plan._id) return `plan:${plan._id}`;
  if (plan.userId) return `user:${plan.userId}`;
  if (plan.trainerId) return `trainer:${plan.trainerId}`;
  return "active-plan";
};

export const getDietPlanV2ConsumptionStorageKey = (
  plan: IDietPlanV2,
  dayKey = getDietPlanV2DayKey()
): string => `diet-plan-v2-consumption:${getDietPlanV2ContextKey(plan)}:${dayKey}`;

export const getDietPlanV2MealKey = (meal: DietV2Meal, index: number): string =>
  meal._id ? `meal:${meal._id}` : `meal-index:${index}`;

export const getDietPlanV2TrackableRows = (meal: DietV2Meal): string[] => {
  const categoryRows = meal.categories.flatMap((category, index) =>
    category.items.some(({ name }) => name.trim().length > 0)
      ? [`category:${category.category}:${index}`]
      : []
  );

  return meal.freeCalories ? [...categoryRows, "free-calories"] : categoryRows;
};

export const reconcileDietPlanV2Completion = (
  plan: IDietPlanV2,
  stored: unknown
): DietPlanV2CompletionMap => {
  if (typeof stored !== "object" || stored === null || Array.isArray(stored)) return {};

  return plan.meals.reduce<DietPlanV2CompletionMap>((completion, meal, index) => {
    const mealKey = getDietPlanV2MealKey(meal, index);
    const value = (stored as Record<string, unknown>)[mealKey];
    if (typeof value !== "object" || value === null || Array.isArray(value)) return completion;

    const rows = getDietPlanV2TrackableRows(meal);
    const rawRows = (value as Record<string, unknown>).selectedRows;
    const selectedRows = Array.isArray(rawRows)
      ? rows.filter((row) => rawRows.some((storedRow) => storedRow === row))
      : [];
    const completed =
      rows.length === 0
        ? (value as Record<string, unknown>).completed === true
        : selectedRows.length === rows.length;

    return { ...completion, [mealKey]: { selectedRows, completed } };
  }, {});
};

export const toggleDietPlanV2Row = (
  completion: DietPlanV2CompletionMap,
  mealKey: string,
  rowKey: string,
  trackableRows: string[]
): DietPlanV2CompletionMap => {
  const selected = new Set(completion[mealKey]?.selectedRows ?? []);

  if (selected.has(rowKey)) selected.delete(rowKey);
  else selected.add(rowKey);

  const selectedRows = trackableRows.filter((key) => selected.has(key));
  const completed = trackableRows.length > 0 && selectedRows.length === trackableRows.length;

  return { ...completion, [mealKey]: { selectedRows, completed } };
};

export const toggleDietPlanV2Meal = (
  completion: DietPlanV2CompletionMap,
  mealKey: string,
  trackableRows: string[]
): DietPlanV2CompletionMap => {
  const completed = completion[mealKey]?.completed ?? false;

  return {
    ...completion,
    [mealKey]: completed
      ? { selectedRows: [], completed: false }
      : { selectedRows: [...trackableRows], completed: true },
  };
};

export const computeDietPlanV2ConsumedTotals = (
  plan: IDietPlanV2,
  completion: DietPlanV2CompletionMap
): DietPlanV2Totals =>
  plan.meals.reduce<DietPlanV2Totals>(
    (totals, meal, index) => {
      if (!completion[getDietPlanV2MealKey(meal, index)]?.completed) return totals;

      const freeCalories = meal.freeCalories?.calories ?? 0;
      return {
        calories: totals.calories + meal.macros.calories + freeCalories,
        protein: totals.protein + meal.macros.protein,
        carbs: totals.carbs + meal.macros.carbs,
        fat: totals.fat + meal.macros.fat,
        freeCalories: totals.freeCalories + freeCalories,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, freeCalories: 0 }
  );
