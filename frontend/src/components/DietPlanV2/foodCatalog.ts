import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";
import type { DietPlanV2Totals } from "./dietPlanV2Utils";

export interface SmartFoodDraft {
  catalogItemId: string;
  barcode: string;
  name: string;
  servingDescription: string;
  servingId: string;
  servingQuantity: number;
  servingUnit: string;
  servingAmount: string;
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
  servingAmount: number;
  servingUnit: string;
  servingReferenceQuantity: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recordedAt: string;
}

export type SmartFoodDraftErrors = Partial<Record<keyof SmartFoodDraft, string>>;

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

export const validateSmartFoodDraft = (draft: SmartFoodDraft): SmartFoodDraftErrors => {
  const errors: SmartFoodDraftErrors = {};

  if (draft.name.trim().length === 0) errors.name = "יש להזין שם מוצר.";

  const servingAmount = parseNumber(draft.servingAmount, false);
  if (draft.servingAmount.trim().length === 0) {
    errors.servingAmount = "יש להזין כמות.";
  } else if (servingAmount === null || servingAmount <= 0) {
    errors.servingAmount = "הכמות חייבת להיות גדולה מאפס.";
  }

  const macroFields: Array<
    [keyof Pick<SmartFoodDraft, "calories" | "protein" | "carbs" | "fat">, string]
  > = [
    ["calories", "הקלוריות חייבות להיות מספר חיובי או אפס."],
    ["protein", "החלבון חייב להיות מספר חיובי או אפס."],
    ["carbs", "הפחמימה חייבת להיות מספר חיובי או אפס."],
    ["fat", "השומן חייב להיות מספר חיובי או אפס."],
  ];
  macroFields.forEach(([field, message]) => {
    if (draft[field].trim().length > 0 && parseNumber(draft[field], true) === null) {
      errors[field] = message;
    }
  });

  return errors;
};

export const createFoodCatalogDraft = (
  product: FoodCatalogProduct,
  servingId?: string
): SmartFoodDraft => {
  const selectedServing =
    product.servings?.find((serving) => serving.id === servingId) ?? product.servings?.[0];
  const nutrition = selectedServing?.nutrition ?? product.nutrition.perServing;
  const servingQuantity = selectedServing?.quantity ?? product.serving?.quantity ?? 1;
  const servingUnit = selectedServing?.unit ?? product.serving?.unit ?? "serving";

  return {
    catalogItemId: product.id,
    barcode: product.identifiers.barcode ?? "",
    name:
      product.displayName ?? product.names.he ?? product.names.en ?? product.names.original ?? "",
    servingId: selectedServing?.id ?? "",
    servingDescription: selectedServing?.description ?? product.serving?.description ?? "מנה אחת",
    servingQuantity,
    servingUnit,
    servingAmount: toInputValue(servingQuantity),
    calories: toInputValue(nutrition.calories),
    protein: toInputValue(nutrition.protein),
    carbs: toInputValue(nutrition.carbohydrates),
    fat: toInputValue(nutrition.fat),
  };
};

export const createSmartFoodEntryDraft = (entry: SmartFoodEntry): SmartFoodDraft => ({
  catalogItemId: entry.catalogItemId,
  barcode: entry.barcode,
  name: entry.name,
  servingDescription: entry.servingDescription,
  servingId: "",
  servingQuantity: entry.servingReferenceQuantity,
  servingUnit: entry.servingUnit,
  servingAmount: toInputValue(entry.servingAmount),
  calories: toInputValue(
    (entry.macros.calories * entry.servingReferenceQuantity) / entry.servingAmount
  ),
  protein: toInputValue(
    (entry.macros.protein * entry.servingReferenceQuantity) / entry.servingAmount
  ),
  carbs: toInputValue((entry.macros.carbs * entry.servingReferenceQuantity) / entry.servingAmount),
  fat: toInputValue((entry.macros.fat * entry.servingReferenceQuantity) / entry.servingAmount),
});

export const createSmartFoodEntry = (
  draft: SmartFoodDraft,
  id: string,
  recordedAt: string
): SmartFoodEntry | null => {
  if (Object.keys(validateSmartFoodDraft(draft)).length > 0) return null;

  const servingAmount = parseNumber(draft.servingAmount, false);
  const calories = parseNumber(draft.calories, true);
  const protein = parseNumber(draft.protein, true);
  const carbs = parseNumber(draft.carbs, true);
  const fat = parseNumber(draft.fat, true);

  if (
    servingAmount === null ||
    !Number.isFinite(draft.servingQuantity) ||
    draft.servingQuantity <= 0 ||
    calories === null ||
    protein === null ||
    carbs === null ||
    fat === null
  ) {
    return null;
  }

  const multiplier = servingAmount / draft.servingQuantity;

  return {
    id,
    catalogItemId: draft.catalogItemId,
    barcode: draft.barcode,
    name: draft.name.trim(),
    servingDescription: draft.servingDescription.trim() || "מנה אחת",
    servingAmount,
    servingUnit: draft.servingUnit.trim() || "serving",
    servingReferenceQuantity: draft.servingQuantity,
    macros: {
      calories: roundNutritionValue(calories * multiplier),
      protein: roundNutritionValue(protein * multiplier),
      carbs: roundNutritionValue(carbs * multiplier),
      fat: roundNutritionValue(fat * multiplier),
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

const SERVING_UNIT_LABELS: Record<string, string> = {
  g: "גרם",
  ml: "מ״ל",
  serving: "מנה",
  cup: "כוס",
  tbsp: "כף",
  tsp: "כפית",
  piece: "יחידה",
  unit: "יחידה",
  package: "אריזה",
};

export const formatSmartFoodServingAmount = (
  entry: Pick<SmartFoodEntry, "servingAmount" | "servingUnit">
): string =>
  `${roundNutritionValue(entry.servingAmount)} ${SERVING_UNIT_LABELS[entry.servingUnit] ?? entry.servingUnit}`;

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
