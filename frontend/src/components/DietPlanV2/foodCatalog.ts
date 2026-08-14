import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";
import type { DietPlanV2Totals } from "./dietPlanV2Utils";

export interface SmartFoodDraft {
  catalogItemId: string;
  barcode: string;
  name: string;
  servingDescription: string;
  servingCount: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface SmartFoodEntry {
  id: string;
  catalogItemId: string;
  barcode: string;
  name: string;
  servingDescription: string;
  servingCount: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recordedAt: string;
}

const roundNutritionValue = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const toInputValue = (value: number | null): string =>
  value === null ? "" : String(roundNutritionValue(value));

const parseNumber = (value: string, allowBlank: boolean): number | null => {
  const normalized = value.trim().replace(",", ".");
  if (allowBlank && normalized.length === 0) return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const createFoodCatalogDraft = (product: FoodCatalogProduct): SmartFoodDraft => ({
  catalogItemId: product.id,
  barcode: product.identifiers.barcode ?? "",
  name: product.displayName ?? product.names.he ?? product.names.en ?? product.names.original ?? "",
  servingDescription: product.serving?.description ?? "מנה אחת",
  servingCount: "1",
  calories: toInputValue(product.nutrition.perServing.calories),
  protein: toInputValue(product.nutrition.perServing.protein),
  carbs: toInputValue(product.nutrition.perServing.carbohydrates),
  fat: toInputValue(product.nutrition.perServing.fat),
});

export const createSmartFoodEntryDraft = (entry: SmartFoodEntry): SmartFoodDraft => ({
  catalogItemId: entry.catalogItemId,
  barcode: entry.barcode,
  name: entry.name,
  servingDescription: entry.servingDescription,
  servingCount: toInputValue(entry.servingCount),
  calories: toInputValue(entry.macros.calories / entry.servingCount),
  protein: toInputValue(entry.macros.protein / entry.servingCount),
  carbs: toInputValue(entry.macros.carbs / entry.servingCount),
  fat: toInputValue(entry.macros.fat / entry.servingCount),
});

export const createSmartFoodEntry = (
  draft: SmartFoodDraft,
  id: string,
  recordedAt: string
): SmartFoodEntry | null => {
  const servingCount = parseNumber(draft.servingCount, false);
  const calories = parseNumber(draft.calories, true);
  const protein = parseNumber(draft.protein, true);
  const carbs = parseNumber(draft.carbs, true);
  const fat = parseNumber(draft.fat, true);

  if (
    draft.name.trim().length === 0 ||
    servingCount === null ||
    servingCount <= 0 ||
    calories === null ||
    protein === null ||
    carbs === null ||
    fat === null
  ) {
    return null;
  }

  return {
    id,
    catalogItemId: draft.catalogItemId,
    barcode: draft.barcode,
    name: draft.name.trim(),
    servingDescription: draft.servingDescription.trim() || "מנה אחת",
    servingCount,
    macros: {
      calories: roundNutritionValue(calories * servingCount),
      protein: roundNutritionValue(protein * servingCount),
      carbs: roundNutritionValue(carbs * servingCount),
      fat: roundNutritionValue(fat * servingCount),
    },
    recordedAt,
  };
};

export const sumSmartFoodMacros = (entries: SmartFoodEntry[]): DietPlanV2Totals =>
  entries.reduce<DietPlanV2Totals>(
    (totals, entry) => ({
      calories: totals.calories + entry.macros.calories,
      protein: totals.protein + entry.macros.protein,
      carbs: totals.carbs + entry.macros.carbs,
      fat: totals.fat + entry.macros.fat,
      freeCalories: totals.freeCalories,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, freeCalories: 0 }
  );

export const replaceSmartFoodEntry = (
  entries: SmartFoodEntry[],
  replacement: SmartFoodEntry
): SmartFoodEntry[] =>
  entries.some(({ id }) => id === replacement.id)
    ? entries.map((entry) => (entry.id === replacement.id ? replacement : entry))
    : entries;

export const addDietPlanV2Totals = (
  left: DietPlanV2Totals,
  right: DietPlanV2Totals
): DietPlanV2Totals => ({
  calories: left.calories + right.calories,
  protein: left.protein + right.protein,
  carbs: left.carbs + right.carbs,
  fat: left.fat + right.fat,
  freeCalories: left.freeCalories + right.freeCalories,
});
