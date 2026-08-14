import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import type { SmartFoodEntry } from "./foodCatalog";
import { getDietPlanV2ContextKey, getDietPlanV2DayKey } from "./dietPlanV2Consumption";

const isFiniteNonnegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const isSmartFoodEntry = (value: unknown): value is SmartFoodEntry => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  const macros = entry.macros as Record<string, unknown> | undefined;

  return (
    typeof entry.id === "string" &&
    typeof entry.catalogItemId === "string" &&
    typeof entry.barcode === "string" &&
    typeof entry.name === "string" &&
    typeof entry.servingDescription === "string" &&
    typeof entry.recordedAt === "string" &&
    isFiniteNonnegativeNumber(entry.servingCount) &&
    typeof macros === "object" &&
    macros !== null &&
    isFiniteNonnegativeNumber(macros.calories) &&
    isFiniteNonnegativeNumber(macros.protein) &&
    isFiniteNonnegativeNumber(macros.carbs) &&
    isFiniteNonnegativeNumber(macros.fat)
  );
};

export const getDietPlanV2SmartFoodsStorageKey = (
  plan: IDietPlanV2,
  dayKey = getDietPlanV2DayKey()
): string => `diet-plan-v2-smart-foods:${getDietPlanV2ContextKey(plan)}:${dayKey}`;

export const reconcileSmartFoodEntries = (stored: unknown): SmartFoodEntry[] =>
  Array.isArray(stored) ? stored.filter(isSmartFoodEntry) : [];
