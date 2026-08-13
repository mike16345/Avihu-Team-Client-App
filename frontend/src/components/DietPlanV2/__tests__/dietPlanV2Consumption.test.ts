import { describe, expect, it } from "vitest";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import {
  computeDietPlanV2ConsumedTotals,
  getDietPlanV2ConsumptionStorageKey,
  getDietPlanV2ContextKey,
  getDietPlanV2DayKey,
  getDietPlanV2MealKey,
  getDietPlanV2TrackableRows,
  reconcileDietPlanV2Completion,
  toggleDietPlanV2Meal,
  toggleDietPlanV2Row,
  type DietPlanV2CompletionMap,
} from "../dietPlanV2Consumption";

const plan: IDietPlanV2 = {
  _id: "plan-1",
  userId: "user-1",
  version: 2,
  highlights: "",
  meals: [
    {
      _id: "meal-1",
      name: "ארוחה 1",
      categories: [
        {
          category: "protein",
          items: [{ name: "100 גרם חזה עוף" }],
          macros: { calories: 200, protein: 25, carbs: 0, fat: 4 },
        },
        {
          category: "carbs",
          items: [{ name: "200 גרם אורז" }],
          macros: { calories: 248.5, protein: 0, carbs: 45, fat: 8 },
        },
        { category: "vegetables", items: [] },
      ],
      addOns: [{ name: "קפה" }],
      macros: { calories: 448.5, protein: 25, carbs: 45, fat: 12 },
      freeCalories: { calories: 150, description: "פרי / חטיף" },
    },
    {
      name: "ארוחה 2",
      categories: [
        {
          category: "protein",
          items: [{ name: "טונה" }],
          macros: { calories: 300, protein: 30, carbs: 0, fat: 5 },
        },
      ],
      addOns: [],
      macros: { calories: 300, protein: 30, carbs: 0, fat: 5 },
    },
  ],
};

describe("V2 meal completion", () => {
  it("scopes persisted completion by plan and the 3am logical day", () => {
    expect(getDietPlanV2DayKey(new Date("2026-08-12T02:59:00Z"))).toBe("2026-08-11");
    expect(getDietPlanV2DayKey(new Date("2026-08-12T03:00:00Z"))).toBe("2026-08-12");
    expect(getDietPlanV2ConsumptionStorageKey(plan, "2026-08-12")).toBe(
      "diet-plan-v2-consumption:plan:plan-1:2026-08-12"
    );
  });

  it("uses server ids and deterministic fallbacks for persisted scope", () => {
    expect(getDietPlanV2ContextKey(plan)).toBe("plan:plan-1");
    expect(getDietPlanV2MealKey(plan.meals[0], 0)).toBe("meal:meal-1");
    expect(getDietPlanV2MealKey(plan.meals[1], 1)).toBe("meal-index:1");
  });

  it("tracks visible categories, add-ons, and free calories without inventing empty rows", () => {
    expect(getDietPlanV2TrackableRows(plan.meals[0])).toEqual([
      "category:protein:0",
      "category:carbs:1",
      "add-ons",
      "free-calories",
    ]);
  });

  it("lets add-ons participate in meal completion without inventing macros", () => {
    const mealKey = getDietPlanV2MealKey(plan.meals[0], 0);
    const rows = getDietPlanV2TrackableRows(plan.meals[0]);
    const completion = toggleDietPlanV2Row({}, mealKey, "add-ons", rows);

    expect(completion[mealKey]?.selectedRows).toEqual(["add-ons"]);
    expect(computeDietPlanV2ConsumedTotals(plan, completion)).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      freeCalories: 0,
    });
  });

  it("adds only the selected category macros for partial completion", () => {
    const mealKey = getDietPlanV2MealKey(plan.meals[0], 0);
    const rows = getDietPlanV2TrackableRows(plan.meals[0]);
    const completion = toggleDietPlanV2Row({}, mealKey, rows[0], rows);

    expect(completion[mealKey]).toEqual({
      selectedRows: ["category:protein:0"],
      completed: false,
    });
    expect(computeDietPlanV2ConsumedTotals(plan, completion)).toEqual({
      calories: 200,
      protein: 25,
      carbs: 0,
      fat: 4,
      freeCalories: 0,
    });
  });

  it("completes a meal after its final row and counts real meal macros once", () => {
    const mealKey = getDietPlanV2MealKey(plan.meals[0], 0);
    const rows = getDietPlanV2TrackableRows(plan.meals[0]);
    let completion: DietPlanV2CompletionMap = {};

    rows.forEach((row) => {
      completion = toggleDietPlanV2Row(completion, mealKey, row, rows);
    });

    expect(completion[mealKey]?.completed).toBe(true);
    expect(computeDietPlanV2ConsumedTotals(plan, completion)).toEqual({
      calories: 598.5,
      protein: 25,
      carbs: 45,
      fat: 12,
      freeCalories: 150,
    });
  });

  it("the whole-meal action atomically selects everything and then undoes it", () => {
    const mealKey = getDietPlanV2MealKey(plan.meals[0], 0);
    const rows = getDietPlanV2TrackableRows(plan.meals[0]);

    const completed = toggleDietPlanV2Meal({}, mealKey, rows);
    expect(completed[mealKey]).toEqual({ selectedRows: rows, completed: true });

    const undone = toggleDietPlanV2Meal(completed, mealKey, rows);
    expect(undone[mealKey]).toEqual({ selectedRows: [], completed: false });
  });

  it("does not invent macros for a meal without populated categories", () => {
    const macroOnlyPlan: IDietPlanV2 = {
      ...plan,
      meals: [{ ...plan.meals[1], categories: [], addOns: [] }],
    };
    const mealKey = getDietPlanV2MealKey(macroOnlyPlan.meals[0], 0);
    const completion = toggleDietPlanV2Meal({}, mealKey, []);

    expect(completion[mealKey]?.completed).toBe(true);
    expect(computeDietPlanV2ConsumedTotals(macroOnlyPlan, completion).calories).toBe(0);
  });

  it("does not keep a meal complete after the trainer adds another row", () => {
    const mealKey = getDietPlanV2MealKey(plan.meals[0], 0);
    const stale: DietPlanV2CompletionMap = {
      [mealKey]: {
        selectedRows: ["category:protein:0", "category:carbs:1"],
        completed: true,
      },
    };

    expect(reconcileDietPlanV2Completion(plan, stale)[mealKey]).toEqual({
      selectedRows: ["category:protein:0", "category:carbs:1"],
      completed: false,
    });
  });
});
