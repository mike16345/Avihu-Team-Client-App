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
  addon: "תוספות",
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

  return value.items.every(
    (item) =>
      isRecord(item) && typeof item.name === "string" && isOptionalString(item.catalogItemId)
  );
};

const hasValidMacros = (value: unknown): boolean =>
  isRecord(value) &&
  isFiniteNumber(value.calories) &&
  isFiniteNumber(value.protein) &&
  isFiniteNumber(value.carbs) &&
  isFiniteNumber(value.fat);

const hasValidFreeCalories = (value: unknown): boolean =>
  value === undefined ||
  (isRecord(value) && isFiniteNumber(value.calories) && typeof value.description === "string");

const isDietV2Meal = (value: unknown): value is DietV2Meal =>
  isRecord(value) &&
  isOptionalString(value._id) &&
  typeof value.name === "string" &&
  Array.isArray(value.categories) &&
  value.categories.every(isDietV2Category) &&
  hasValidMacros(value.macros) &&
  hasValidFreeCalories(value.freeCalories) &&
  (value.supplements === undefined || isStringArray(value.supplements));

const getFiniteValue = (value: number): number => (Number.isFinite(value) ? value : 0);

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
    return hasNonblankString(plan.highlights) ? "ready" : "empty";
  }

  const hasInstructions = plan.customInstructions?.some((value) => !isHtmlEmpty(value)) ?? false;
  const hasSupplements = plan.supplements?.some((value) => !isHtmlEmpty(value)) ?? false;

  return hasInstructions || hasSupplements ? "ready" : "empty";
};

export const computeDietPlanV2Totals = (plan: IDietPlanV2): DietPlanV2Totals =>
  plan.meals.reduce<DietPlanV2Totals>(
    (totals, meal) => ({
      calories: totals.calories + getFiniteValue(meal.macros.calories),
      protein: totals.protein + getFiniteValue(meal.macros.protein),
      carbs: totals.carbs + getFiniteValue(meal.macros.carbs),
      fat: totals.fat + getFiniteValue(meal.macros.fat),
      freeCalories: totals.freeCalories + getFiniteValue(meal.freeCalories?.calories ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, freeCalories: 0 }
  );

export const getVisibleDietV2Categories = (meal: DietV2Meal): DietV2Category[] =>
  meal.categories.filter((category) => category.items.some(({ name }) => hasNonblankString(name)));

export const formatDietV2CategoryItems = (category: DietV2Category): string =>
  category.items
    .map(({ name }) => name.trim())
    .filter(hasNonblankString)
    .join(" / ");
