import { DietV2Plan } from "@/interfaces/DietPlanV2";

export const DIET_V2_MOCK_PLAN: DietV2Plan = {
  freeCalories: 200,
  meals: [
    {
      id: "meal-1",
      name: "ארוחת בוקר",
      note: "לפני האימון — עדיף לאכול פחמימה איטית",
      categories: [
        {
          kind: "protein",
          manualPrimaryGrams: 25,
          manualCalories: 140,
          options: [
            {
              id: "opt-1",
              foodName: "חביתה משני ביצים",
              quantity: 2,
              unit: "units",
              macros: { protein: 12, carbs: 1, fat: 10, calories: 140 },
            },
            {
              id: "opt-2",
              foodName: "יוגורט יווני 5%",
              quantity: 200,
              unit: "g",
              macros: { protein: 18, carbs: 8, fat: 10, calories: 190 },
            },
          ],
        },
        {
          kind: "carbs",
          manualPrimaryGrams: 45,
          manualCalories: 180,
          options: [
            {
              id: "opt-3",
              foodName: "שיבולת שועל עם חלב",
              quantity: 50,
              unit: "g",
              macros: { protein: 6, carbs: 33, fat: 3, calories: 180 },
            },
            {
              id: "opt-4",
              foodName: "לחם מלא",
              quantity: 2,
              unit: "slice",
              macros: { protein: 6, carbs: 30, fat: 2, calories: 160 },
            },
          ],
        },
        {
          kind: "fat",
          manualPrimaryGrams: 12,
          manualCalories: 108,
          options: [
            {
              id: "opt-5",
              foodName: "חמאת בוטנים",
              quantity: 1,
              unit: "spoons",
              macros: { protein: 4, carbs: 3, fat: 12, calories: 108 },
            },
          ],
        },
        {
          kind: "vegetables",
          manualCalories: 20,
          options: [
            {
              id: "opt-6",
              foodName: "עגבניות שרי",
              quantity: 1,
              unit: "cups",
              macros: { protein: 1, carbs: 4, fat: 0, calories: 20 },
            },
          ],
        },
      ],
    },
    {
      id: "meal-2",
      name: "ארוחת צהריים",
      categories: [
        {
          kind: "protein",
          manualPrimaryGrams: 40,
          manualCalories: 220,
          options: [
            {
              id: "opt-7",
              foodName: "חזה עוף בגריל",
              quantity: 150,
              unit: "g",
              macros: { protein: 45, carbs: 0, fat: 5, calories: 220 },
            },
            {
              id: "opt-8",
              foodName: "טונה במים",
              quantity: 1,
              unit: "units",
              macros: { protein: 30, carbs: 0, fat: 2, calories: 140 },
            },
          ],
        },
        {
          kind: "carbs",
          manualPrimaryGrams: 60,
          manualCalories: 220,
          options: [
            {
              id: "opt-9",
              foodName: "אורז בסמטי",
              quantity: 150,
              unit: "g",
              macros: { protein: 4, carbs: 45, fat: 1, calories: 200 },
            },
            {
              id: "opt-10",
              foodName: "תפוח אדמה אפוי",
              quantity: 2,
              unit: "piece_medium",
              macros: { protein: 5, carbs: 55, fat: 0, calories: 240 },
            },
          ],
        },
        {
          kind: "fat",
          manualPrimaryGrams: 10,
          manualCalories: 90,
          options: [
            {
              id: "opt-11",
              foodName: "שמן זית",
              quantity: 1,
              unit: "spoons",
              macros: { protein: 0, carbs: 0, fat: 14, calories: 120 },
            },
          ],
        },
        {
          kind: "vegetables",
          manualCalories: 60,
          options: [
            {
              id: "opt-12",
              foodName: "סלט ירקות טרי",
              quantity: 2,
              unit: "cups",
              macros: { protein: 2, carbs: 10, fat: 1, calories: 60 },
            },
          ],
        },
      ],
    },
    {
      id: "meal-3",
      name: "ארוחת ערב",
      categories: [
        {
          kind: "protein",
          manualPrimaryGrams: 30,
          manualCalories: 165,
          options: [
            {
              id: "opt-13",
              foodName: "סלמון אפוי",
              quantity: 120,
              unit: "g",
              macros: { protein: 25, carbs: 0, fat: 8, calories: 175 },
            },
          ],
        },
        {
          kind: "carbs",
          manualPrimaryGrams: 30,
          manualCalories: 120,
          options: [
            {
              id: "opt-14",
              foodName: "קינואה",
              quantity: 100,
              unit: "g",
              macros: { protein: 4, carbs: 25, fat: 2, calories: 120 },
            },
          ],
        },
        {
          kind: "fat",
          manualPrimaryGrams: 8,
          manualCalories: 72,
          options: [],
        },
        {
          kind: "vegetables",
          manualCalories: 40,
          options: [
            {
              id: "opt-15",
              foodName: "ברוקולי מאודה",
              quantity: 1,
              unit: "cups",
              macros: { protein: 3, carbs: 6, fat: 0, calories: 40 },
            },
          ],
        },
      ],
    },
  ],
};

export const DIET_V2_MOCK_TIPS: string[] = [];
