import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import type { SmartFoodEntry } from "./foodCatalog";
import { getDietPlanV2ContextKey, getDietPlanV2DayKey } from "./dietPlanV2Consumption";

const isFiniteNonnegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const getSmartFoodEntryBase = (value: unknown) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  const macros = entry.macros as Record<string, unknown> | undefined;

  const valid =
    typeof entry.id === "string" &&
    typeof entry.catalogItemId === "string" &&
    typeof entry.barcode === "string" &&
    typeof entry.name === "string" &&
    typeof entry.servingDescription === "string" &&
    typeof entry.recordedAt === "string" &&
    typeof macros === "object" &&
    macros !== null &&
    isFiniteNonnegativeNumber(macros.calories) &&
    isFiniteNonnegativeNumber(macros.protein) &&
    isFiniteNonnegativeNumber(macros.carbs) &&
    isFiniteNonnegativeNumber(macros.fat);

  return valid ? entry : null;
};

const normalizeStoredSmartFoodEntry = (value: unknown): SmartFoodEntry | null => {
  const entry = getSmartFoodEntryBase(value);
  if (!entry) return null;

  if (
    isFiniteNonnegativeNumber(entry.servingAmount) &&
    entry.servingAmount > 0 &&
    typeof entry.servingUnit === "string" &&
    isFiniteNonnegativeNumber(entry.servingReferenceQuantity) &&
    entry.servingReferenceQuantity > 0
  ) {
    return entry as unknown as SmartFoodEntry;
  }

  if (!isFiniteNonnegativeNumber(entry.servingCount) || entry.servingCount <= 0) return null;

  const description = entry.servingDescription as string;
  const match = description.match(/^\s*(\d+(?:[.,]\d+)?)\s*(.*)$/u);
  const servingReferenceQuantity = match ? Number(match[1].replace(",", ".")) : 1;
  const servingUnit = match?.[2].trim() || description.trim() || "serving";

  return {
    id: entry.id as string,
    catalogItemId: entry.catalogItemId as string,
    barcode: entry.barcode as string,
    name: entry.name as string,
    servingDescription: description,
    servingAmount: entry.servingCount * servingReferenceQuantity,
    servingUnit,
    servingReferenceQuantity,
    macros: entry.macros as SmartFoodEntry["macros"],
    recordedAt: entry.recordedAt as string,
  };
};

export const getDietPlanV2SmartFoodsStorageKey = (
  plan: IDietPlanV2,
  dayKey = getDietPlanV2DayKey()
): string => `diet-plan-v2-smart-foods:${getDietPlanV2ContextKey(plan)}:${dayKey}`;

export const reconcileSmartFoodEntries = (stored: unknown): SmartFoodEntry[] =>
  Array.isArray(stored)
    ? stored.flatMap((entry) => {
        const normalized = normalizeStoredSmartFoodEntry(entry);
        return normalized ? [normalized] : [];
      })
    : [];

export const getDietPlanV2SmartFoodsHistoryDayKeys = (
  now = new Date(),
  weekOffset = 0
): string[] => {
  const currentDayKey = getDietPlanV2DayKey(now);
  const [year, month, day] = currentDayKey.split("-").map(Number);
  const currentLogicalDay = new Date(year, month - 1, day, 12);
  const firstDayOffset = Math.max(0, Math.floor(weekOffset)) * 7;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentLogicalDay);
    date.setDate(date.getDate() - firstDayOffset - index);
    const dateYear = date.getFullYear();
    const dateMonth = String(date.getMonth() + 1).padStart(2, "0");
    const dateDay = String(date.getDate()).padStart(2, "0");
    return `${dateYear}-${dateMonth}-${dateDay}`;
  });
};
