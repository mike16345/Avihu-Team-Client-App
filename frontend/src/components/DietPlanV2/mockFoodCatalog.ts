import { DietV2OptionMacros } from "@/interfaces/DietPlanV2";

export type FoodUnit = "unit" | "gram" | "spoon";

export const GRAMS_PER_SPOON = 15;

export interface MockFoodItem {
  id: string;
  name: string;
  servingLabel: string;
  gramsPerServing: number;
  availableUnits: FoodUnit[];
  macros: DietV2OptionMacros;
}

export const MOCK_FOOD_CATALOG: MockFoodItem[] = [
  {
    id: "food-1",
    name: "מעדן חלבון פרו",
    servingLabel: "יחידה 200 גרם",
    gramsPerServing: 200,
    availableUnits: ["unit", "gram"],
    macros: { protein: 25, carbs: 8, fat: 2, calories: 155 },
  },
  {
    id: "food-2",
    name: "בננה בינונית",
    servingLabel: "יחידה",
    gramsPerServing: 120,
    availableUnits: ["unit", "gram"],
    macros: { protein: 1, carbs: 27, fat: 0, calories: 105 },
  },
  {
    id: "food-3",
    name: "תפוח עץ",
    servingLabel: "יחידה בינונית",
    gramsPerServing: 180,
    availableUnits: ["unit", "gram"],
    macros: { protein: 0, carbs: 25, fat: 0, calories: 95 },
  },
  {
    id: "food-4",
    name: "ביצה קשה",
    servingLabel: "יחידה",
    gramsPerServing: 50,
    availableUnits: ["unit", "gram"],
    macros: { protein: 6, carbs: 1, fat: 5, calories: 70 },
  },
  {
    id: "food-5",
    name: "לחם מלא",
    servingLabel: "פרוסה",
    gramsPerServing: 30,
    availableUnits: ["unit", "gram"],
    macros: { protein: 3, carbs: 12, fat: 1, calories: 70 },
  },
  {
    id: "food-6",
    name: "שוקולד מריר 70%",
    servingLabel: "30 גרם",
    gramsPerServing: 30,
    availableUnits: ["gram"],
    macros: { protein: 2, carbs: 18, fat: 12, calories: 180 },
  },
  {
    id: "food-7",
    name: "יוגורט יווני 5%",
    servingLabel: "200 גרם",
    gramsPerServing: 200,
    availableUnits: ["gram", "spoon"],
    macros: { protein: 18, carbs: 8, fat: 10, calories: 190 },
  },
  {
    id: "food-8",
    name: "אבוקדו",
    servingLabel: "חצי יחידה",
    gramsPerServing: 100,
    availableUnits: ["unit", "gram"],
    macros: { protein: 2, carbs: 9, fat: 15, calories: 160 },
  },
  {
    id: "food-9",
    name: "חמאת בוטנים",
    servingLabel: "כף",
    gramsPerServing: GRAMS_PER_SPOON,
    availableUnits: ["spoon", "gram"],
    macros: { protein: 4, carbs: 3, fat: 8, calories: 95 },
  },
  {
    id: "food-10",
    name: "אורז לבן מבושל",
    servingLabel: "100 גרם",
    gramsPerServing: 100,
    availableUnits: ["gram", "spoon"],
    macros: { protein: 3, carbs: 28, fat: 0, calories: 130 },
  },
  {
    id: "food-11",
    name: "פסטה מבושלת",
    servingLabel: "100 גרם",
    gramsPerServing: 100,
    availableUnits: ["gram"],
    macros: { protein: 5, carbs: 30, fat: 1, calories: 158 },
  },
  {
    id: "food-12",
    name: "חזה עוף בגריל",
    servingLabel: "100 גרם",
    gramsPerServing: 100,
    availableUnits: ["gram"],
    macros: { protein: 31, carbs: 0, fat: 3, calories: 165 },
  },
  {
    id: "food-13",
    name: "שיבולת שועל",
    servingLabel: "50 גרם",
    gramsPerServing: 50,
    availableUnits: ["gram", "spoon"],
    macros: { protein: 7, carbs: 34, fat: 3, calories: 190 },
  },
  {
    id: "food-14",
    name: "ביצים (2)",
    servingLabel: "2 יחידות",
    gramsPerServing: 100,
    availableUnits: ["unit", "gram"],
    macros: { protein: 12, carbs: 2, fat: 10, calories: 140 },
  },
  {
    id: "food-15",
    name: "יוגורט 5%",
    servingLabel: "150 גרם",
    gramsPerServing: 150,
    availableUnits: ["gram", "spoon"],
    macros: { protein: 8, carbs: 10, fat: 7, calories: 120 },
  },
];

export interface ConsumedFoodEntry {
  entryId: string;
  food: MockFoodItem;
  quantity: number;
  mealId?: string;
}

export interface NoteReminderEntry {
  entryId: string;
  text: string;
  mealId?: string;
}

export const sumConsumedMacros = (entries: ConsumedFoodEntry[]): DietV2OptionMacros => {
  return entries.reduce(
    (acc, entry) => ({
      protein: acc.protein + entry.food.macros.protein * entry.quantity,
      carbs: acc.carbs + entry.food.macros.carbs * entry.quantity,
      fat: acc.fat + entry.food.macros.fat * entry.quantity,
      calories: acc.calories + entry.food.macros.calories * entry.quantity,
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  );
};
