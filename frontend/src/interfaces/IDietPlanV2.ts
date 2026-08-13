export const DIET_V2_MEAL_CATEGORIES = ["protein", "carbs", "fat", "vegetables"] as const;
export type DietV2MealCategory = (typeof DIET_V2_MEAL_CATEGORIES)[number];

export interface DietV2PlanItem {
  name: string;
  catalogItemId?: string;
}

export interface DietV2Category {
  category: DietV2MealCategory;
  items: DietV2PlanItem[];
  macros?: DietV2MealMacros;
}

export interface DietV2MealMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietV2FreeCalories {
  calories: number;
  description: string;
}

export interface DietV2Meal {
  _id?: string;
  name: string;
  categories: DietV2Category[];
  addOns: DietV2PlanItem[];
  macros: DietV2MealMacros;
  freeCalories?: DietV2FreeCalories;
  supplements?: string[];
}

export interface IDietPlanV2 {
  _id?: string;
  userId?: string;
  trainerId?: string;
  version: 2;
  meals: DietV2Meal[];
  highlights: string;
}
