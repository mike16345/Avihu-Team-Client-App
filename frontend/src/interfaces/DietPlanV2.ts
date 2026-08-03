export const DIET_V2_CATEGORY_KINDS = [
  "protein",
  "carbs",
  "fat",
  "vegetables",
  "addon",
  "freeCalories",
] as const;

export type DietV2CategoryKind = (typeof DIET_V2_CATEGORY_KINDS)[number];

export const DIET_V2_UNITS = [
  "g",
  "spoons",
  "cups",
  "units",
  "slice",
  "piece",
  "piece_medium",
] as const;

export type DietV2Unit = (typeof DIET_V2_UNITS)[number];

export const DIET_V2_UNIT_LABELS: Record<DietV2Unit, string> = {
  g: "גרם",
  spoons: "כפות",
  cups: "כוסות",
  units: "יח׳",
  slice: "פרוסות",
  piece: "חתיכה",
  piece_medium: "חתיכה בינונית",
};

const DIET_V2_UNIT_LABELS_PLURAL: Partial<Record<DietV2Unit, string>> = {
  piece: "חתיכות",
  piece_medium: "חתיכות בינוניות",
};

export const formatUnitLabel = (unit: DietV2Unit, quantity: number): string => {
  if (quantity !== 1 && DIET_V2_UNIT_LABELS_PLURAL[unit]) {
    return DIET_V2_UNIT_LABELS_PLURAL[unit] as string;
  }
  return DIET_V2_UNIT_LABELS[unit];
};

export interface DietV2OptionMacros {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface DietV2Option {
  id: string;
  foodName: string;
  quantity: number;
  unit: DietV2Unit;
  macros: DietV2OptionMacros;
  estimated?: boolean;
  cloudSourced?: boolean;
}

export interface DietV2Category {
  kind: DietV2CategoryKind;
  options: DietV2Option[];
  note?: string;
  manualPrimaryGrams?: number;
  manualCalories?: number;
}

export interface DietV2Meal {
  id: string;
  name: string;
  categories: DietV2Category[];
  note?: string;
  macros?: DietV2OptionMacros;
}

export interface DietV2Plan {
  meals: DietV2Meal[];
  freeCalories?: number;
}
