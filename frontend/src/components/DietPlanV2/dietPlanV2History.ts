import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import type { SmartFoodEntry } from "./foodCatalog";
import type { DietPlanV2CompletionMap } from "./dietPlanV2Consumption";
import { getDietPlanV2MealKey } from "./dietPlanV2Consumption";
import {
  DIET_V2_CATEGORY_LABELS,
  formatDietV2CategoryItems,
  formatDietV2Items,
  type DietPlanV2Totals,
} from "./dietPlanV2Utils";

export interface DietPlanV2HistoryEntry {
  id: string;
  name: string;
  detail: string;
  macros: Pick<DietPlanV2Totals, "calories" | "protein" | "carbs" | "fat">;
  source: "meal" | "catalog";
}

const ZERO_MACROS = { calories: 0, protein: 0, carbs: 0, fat: 0 } as const;

export const buildDietPlanV2HistoryEntries = (
  plan: IDietPlanV2,
  completion: DietPlanV2CompletionMap,
  smartFoods: SmartFoodEntry[]
): DietPlanV2HistoryEntry[] => {
  const mealEntries = plan.meals.flatMap<DietPlanV2HistoryEntry>((meal, mealIndex) => {
    const mealKey = getDietPlanV2MealKey(meal, mealIndex);
    const selected = new Set(completion[mealKey]?.selectedRows ?? []);
    const mealName = meal.name.trim() || `ארוחה ${mealIndex + 1}`;
    const categoryEntries = meal.categories.flatMap<DietPlanV2HistoryEntry>(
      (category, categoryIndex) => {
        const rowKey = `category:${category.category}:${categoryIndex}`;
        const name = formatDietV2CategoryItems(category);
        if (!selected.has(rowKey) || !name) return [];

        return [
          {
            id: `${mealKey}:${rowKey}`,
            name,
            detail: `${mealName} · ${DIET_V2_CATEGORY_LABELS[category.category]}`,
            macros: category.macros ?? ZERO_MACROS,
            source: "meal",
          },
        ];
      }
    );
    const addOnName = formatDietV2Items(meal.addOns);
    const addOnEntries: DietPlanV2HistoryEntry[] =
      selected.has("add-ons") && addOnName
        ? [
            {
              id: `${mealKey}:add-ons`,
              name: addOnName,
              detail: `${mealName} · תוספות`,
              macros: ZERO_MACROS,
              source: "meal",
            },
          ]
        : [];
    const freeCaloriesEntries: DietPlanV2HistoryEntry[] =
      selected.has("free-calories") && meal.freeCalories
        ? [
            {
              id: `${mealKey}:free-calories`,
              name: meal.freeCalories.description.trim() || "קלוריות חופשיות",
              detail: `${mealName} · קלוריות חופשיות`,
              macros: { ...ZERO_MACROS, calories: meal.freeCalories.calories },
              source: "meal",
            },
          ]
        : [];

    return [...categoryEntries, ...addOnEntries, ...freeCaloriesEntries];
  });

  const catalogEntries = smartFoods.map<DietPlanV2HistoryEntry>((entry) => ({
    id: `catalog:${entry.id}`,
    name: entry.name,
    detail: `${entry.servingCount} × ${entry.servingDescription}`,
    macros: entry.macros,
    source: "catalog",
  }));

  return [...mealEntries, ...catalogEntries];
};

export const sumDietPlanV2HistoryMacros = (entries: DietPlanV2HistoryEntry[]): DietPlanV2Totals =>
  entries.reduce<DietPlanV2Totals>(
    (totals, entry) => ({
      calories: totals.calories + entry.macros.calories,
      protein: totals.protein + entry.macros.protein,
      carbs: totals.carbs + entry.macros.carbs,
      fat: totals.fat + entry.macros.fat,
      freeCalories: 0,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, freeCalories: 0 }
  );
