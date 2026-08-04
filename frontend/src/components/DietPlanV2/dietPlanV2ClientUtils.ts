import { DietV2Category, DietV2CategoryKind, DietV2OptionMacros } from "@/interfaces/DietPlanV2";

export const CATEGORY_LABELS: Record<DietV2CategoryKind, string> = {
  protein: "חלבון",
  carbs: "פחמימה",
  fat: "שומן",
  vegetables: "ירקות",
  addon: "תוסף תזונה",
  freeCalories: "קלוריות חופשיות",
};

const emptyMacros = (): DietV2OptionMacros => ({
  protein: 0,
  carbs: 0,
  fat: 0,
  calories: 0,
});

const round = (value: number): number => Math.round(value * 10) / 10;

const primaryMacroKey = (kind: DietV2CategoryKind): keyof DietV2OptionMacros | null => {
  switch (kind) {
    case "protein":
      return "protein";
    case "carbs":
      return "carbs";
    case "fat":
      return "fat";
    default:
      return null;
  }
};

export const computeCategoryPrimaryGrams = (category: DietV2Category): number => {
  if (typeof category.manualPrimaryGrams === "number") {
    return round(category.manualPrimaryGrams);
  }
  const key = primaryMacroKey(category.kind);
  if (!key) return 0;
  const first = category.options[0];
  if (!first) return 0;
  return round(first.macros[key] ?? 0);
};

export const computeCategoryCalories = (category: DietV2Category): number => {
  if (typeof category.manualCalories === "number") {
    return Math.round(category.manualCalories);
  }
  const first = category.options[0];
  if (!first) return 0;
  return Math.round(first.macros.calories ?? 0);
};

export const computeMealTotalsFromCategories = (
  categories: DietV2Category[]
): DietV2OptionMacros => {
  const totals = emptyMacros();
  for (const category of categories) {
    const key = primaryMacroKey(category.kind);
    if (key) {
      totals[key] += computeCategoryPrimaryGrams(category);
    }
    totals.calories += computeCategoryCalories(category);
  }
  return {
    protein: round(totals.protein),
    carbs: round(totals.carbs),
    fat: round(totals.fat),
    calories: Math.round(totals.calories),
  };
};
