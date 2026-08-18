import type { IDietPlan } from "@/interfaces/DietPlan";
import type { AnyDietPlan } from "@/interfaces/DietPlanTypes";
import {
  DIET_V2_MEAL_CATEGORIES,
  type DietV2Category,
  type DietV2Meal,
  type DietV2MealCategory,
  type IDietPlanV2,
} from "@/interfaces/IDietPlanV2";
import { isHtmlEmpty } from "@/utils/htmlUtils";

export const DIET_V2_CATEGORY_LABELS: Record<DietV2MealCategory, string> = {
  protein: "חלבון",
  carbs: "פחמימה",
  fat: "שומן",
  vegetables: "ירקות",
};

export interface DietPlanV2Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  freeCalories: number;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isDietV2Category = (value: unknown): value is DietV2Category => {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return false;
  }

  if (!DIET_V2_MEAL_CATEGORIES.some((category) => category === value.category)) {
    return false;
  }

  const hasValidItems = value.items.every(
    (item) =>
      isRecord(item) && typeof item.name === "string" && isOptionalString(item.catalogItemId)
  );

  return (
    hasValidItems &&
    (value.items.length === 0
      ? value.macros === undefined || hasValidCategoryMacros(value.category, value.macros)
      : hasValidCategoryMacros(value.category, value.macros))
  );
};

const hasValidCategoryMacros = (category: unknown, value: unknown): boolean => {
  if (!isRecord(value) || !isFiniteNumber(value.calories)) return false;
  if (category === "protein") return isFiniteNumber(value.protein);
  if (category === "carbs" || category === "vegetables") return isFiniteNumber(value.carbs);
  if (category === "fat") return isFiniteNumber(value.fat);
  return false;
};

const hasValidMacros = (value: unknown): boolean =>
  isRecord(value) &&
  isFiniteNumber(value.calories) &&
  isFiniteNumber(value.protein) &&
  isFiniteNumber(value.carbs) &&
  isFiniteNumber(value.fat);

const hasValidFreeCalories = (value: unknown): boolean =>
  value === undefined ||
  (isRecord(value) &&
    isFiniteNumber(value.calories) &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.every(
      (item) =>
        isRecord(item) && typeof item.name === "string" && isOptionalString(item.catalogItemId)
    ));

const isDietV2Meal = (value: unknown): value is DietV2Meal =>
  isRecord(value) &&
  isOptionalString(value._id) &&
  typeof value.name === "string" &&
  Array.isArray(value.categories) &&
  value.categories.every(isDietV2Category) &&
  Array.isArray(value.addOns) &&
  value.addOns.every(
    (item) =>
      isRecord(item) && typeof item.name === "string" && isOptionalString(item.catalogItemId)
  ) &&
  hasValidMacros(value.macros) &&
  hasValidFreeCalories(value.freeCalories) &&
  (value.supplements === undefined || isStringArray(value.supplements));

const getFiniteValue = (value: number | undefined): number =>
  Number.isFinite(value) ? (value as number) : 0;

const hasNonblankString = (value: unknown): boolean =>
  typeof value === "string" && value.trim().length > 0;

export const resolveDietPlanVersion = (plan: unknown): 1 | 2 | null => {
  if (!isRecord(plan)) {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(plan, "version") || plan.version === 1) {
    return 1;
  }

  return plan.version === 2 ? 2 : null;
};

export const isDietPlanV2 = (plan: unknown): plan is IDietPlanV2 =>
  isRecord(plan) &&
  plan.version === 2 &&
  isOptionalString(plan._id) &&
  isOptionalString(plan.userId) &&
  isOptionalString(plan.trainerId) &&
  Array.isArray(plan.meals) &&
  plan.meals.every(isDietV2Meal) &&
  typeof plan.highlights === "string";

export const isDietPlanV1 = (plan: AnyDietPlan): plan is IDietPlan =>
  resolveDietPlanVersion(plan) === 1;

export const selectDietPlanV1 = (plan: AnyDietPlan): IDietPlan | undefined =>
  isDietPlanV1(plan) ? plan : undefined;

export const getDietPlanContentState = (plan: AnyDietPlan): "empty" | "ready" => {
  if (plan.meals.length > 0) {
    return "ready";
  }

  if (plan.version === 2) {
    return !isHtmlEmpty(plan.highlights) ? "ready" : "empty";
  }

  const hasInstructions = plan.customInstructions?.some((value) => !isHtmlEmpty(value)) ?? false;
  const hasSupplements = plan.supplements?.some((value) => !isHtmlEmpty(value)) ?? false;

  return hasInstructions || hasSupplements ? "ready" : "empty";
};

export const computeDietPlanV2Totals = (plan: IDietPlanV2): DietPlanV2Totals =>
  plan.meals.reduce<DietPlanV2Totals>(
    (totals, meal) => {
      const mealMacros = deriveDietPlanV2MealMacros(meal);
      return {
        calories: totals.calories + mealMacros.calories,
        protein: totals.protein + mealMacros.protein,
        carbs: totals.carbs + mealMacros.carbs,
        fat: totals.fat + mealMacros.fat,
        freeCalories: totals.freeCalories + getFiniteValue(meal.freeCalories?.calories ?? 0),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, freeCalories: 0 }
  );

export const isDecimalNumber = (value: string | number): boolean => {
  if (typeof value === "number") {
    return Number.isFinite(value) && !Number.isInteger(value);
  }
  if (typeof value === "string") {
    const parsedValue = parseFloat(value);
    return !isNaN(parsedValue) && !Number.isInteger(parsedValue);
  }
  return false;
};

export const toFixedDecimal = (value: string | number, decimals: number) => {
  if (typeof value === "string" && isDecimalNumber(value)) {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      return value;
    }
    return parsedValue.toFixed(decimals);
  } else if (typeof value === "number" && value !== 0 && isDecimalNumber(value)) {
    return value.toFixed(decimals);
  }

  return value;
};

export const formatDietPlanV2Number = (value: number): string =>
  Object.is(value, -0) ? "0" : toFixedDecimal(value.toString(), 2);

export const formatDietPlanV2MealMacroSummary = (
  macros: Pick<DietPlanV2Totals, "calories" | "protein" | "carbs" | "fat">
): string =>
  `${formatDietPlanV2Number(macros.calories)} קק"ל · ${formatDietPlanV2Number(macros.protein)} חלב׳ · ${formatDietPlanV2Number(macros.carbs)} פחמ׳ · ${formatDietPlanV2Number(macros.fat)} ש׳`;

export const getDietPlanV2CalorieTarget = (totals: DietPlanV2Totals): number =>
  totals.calories + totals.freeCalories;

export const getVisibleDietV2Categories = (meal: DietV2Meal): DietV2Category[] =>
  meal.categories.filter((category) => category.items.some(({ name }) => hasNonblankString(name)));

export const formatDietV2CategoryItems = (category: DietV2Category): string =>
  category.items
    .map(({ name }) => name.trim())
    .filter(hasNonblankString)
    .join(" / ");

export const formatDietV2CategoryMacros = (category: DietV2Category): string => {
  if (!category.macros) return "";

  const calories = `${formatDietPlanV2Number(category.macros.calories)} קק״ל`;
  if (category.category === "protein") {
    return `${formatDietPlanV2Number(getFiniteValue(category.macros.protein))} ג׳ חלבון · ${calories}`;
  }
  if (category.category === "fat") {
    return `${formatDietPlanV2Number(getFiniteValue(category.macros.fat))} ג׳ שומן · ${calories}`;
  }
  return `${formatDietPlanV2Number(getFiniteValue(category.macros.carbs))} ג׳ פחמימה · ${calories}`;
};

export const formatDietV2Items = (items: DietV2Category["items"]): string =>
  items
    .map(({ name }) => name.trim())
    .filter(hasNonblankString)
    .join(" / ");

export const deriveDietPlanV2MealMacros = (meal: DietV2Meal) =>
  meal.categories.reduce(
    (totals, category) => {
      if (!category.items.some(({ name }) => hasNonblankString(name)) || !category.macros) {
        return totals;
      }

      return {
        calories: totals.calories + getFiniteValue(category.macros.calories),
        protein: totals.protein + getFiniteValue(category.macros.protein),
        carbs: totals.carbs + getFiniteValue(category.macros.carbs),
        fat: totals.fat + getFiniteValue(category.macros.fat),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
