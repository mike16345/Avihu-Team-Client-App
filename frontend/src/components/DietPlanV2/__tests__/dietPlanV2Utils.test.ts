import { describe, expect, it } from "vitest";
import type { IDietPlan } from "@/interfaces/DietPlan";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import {
  computeDietPlanV2Totals,
  formatDietV2CategoryItems,
  getDietPlanContentState,
  getVisibleDietV2Categories,
  isDietPlanV2,
  resolveDietPlanVersion,
  selectDietPlanV1,
} from "../dietPlanV2Utils";

const v1Plan: IDietPlan = {
  meals: [],
  freeCalories: 0,
};

const plan: IDietPlanV2 = {
  version: 2,
  highlights: "לשתות מים\nלהכין מראש",
  meals: [
    {
      _id: "meal-1",
      name: "ארוחה 1",
      categories: [
        {
          category: "protein",
          items: [{ name: "100 גרם חזה עוף" }, { name: "2 ביצים" }],
        },
        { category: "vegetables", items: [] },
      ],
      macros: { calories: 448, protein: 25, carbs: 45, fat: 12 },
      freeCalories: { calories: 150, description: "פרי / חטיף / כף ממרח" },
    },
    {
      _id: "meal-2",
      name: "ארוחה 2",
      categories: [{ category: "carbs", items: [{ name: "200 גרם אורז" }] }],
      macros: { calories: 590, protein: 40, carbs: 60, fat: 10 },
    },
  ],
};

describe("diet plan version resolution", () => {
  it("treats a missing version and explicit version 1 as V1", () => {
    expect(resolveDietPlanVersion({ meals: [] })).toBe(1);
    expect(resolveDietPlanVersion({ version: 1, meals: [] })).toBe(1);
  });

  it("selects V2 only for literal version 2", () => {
    expect(resolveDietPlanVersion(plan)).toBe(2);
  });

  it("rejects unsupported versions", () => {
    expect(resolveDietPlanVersion({ version: 3, meals: [] })).toBeNull();
  });

  it.each([0, 1.5, 3, "1", "2", null])(
    "never resolves malformed or unsupported version %j to V1",
    (version) => {
      expect(resolveDietPlanVersion({ version, meals: [] })).toBeNull();
    }
  );

  it("rejects a malformed V2 payload at the V2 type boundary", () => {
    expect(isDietPlanV2({ version: 2, meals: [], highlights: "" })).toBe(true);
    expect(isDietPlanV2({ version: 2, meals: [{ name: "broken" }], highlights: "" })).toBe(false);
  });

  it("accepts a displayable meal without an _id", () => {
    const mealWithoutId = { ...plan.meals[0], _id: undefined };

    expect(isDietPlanV2({ ...plan, meals: [mealWithoutId] })).toBe(true);
  });

  it("selects only resolved V1 plans for legacy consumers", () => {
    expect(selectDietPlanV1(v1Plan)).toBe(v1Plan);
    expect(selectDietPlanV1(plan)).toBeUndefined();
  });
});

describe("V2 display derivation", () => {
  it("sums meal macros and free calories without merging them", () => {
    expect(computeDietPlanV2Totals(plan)).toEqual({
      calories: 1038,
      protein: 65,
      carbs: 105,
      fat: 22,
      freeCalories: 150,
    });
  });

  it("keeps literal item text and joins it with slashes", () => {
    expect(formatDietV2CategoryItems(plan.meals[0].categories[0])).toBe(
      "100 גרם חזה עוף / 2 ביצים"
    );
  });

  it("trims only the outside of long literal item strings", () => {
    expect(
      formatDietV2CategoryItems({
        category: "protein",
        items: [{ name: "  100 גרם חזה עוף בגריל עם תיבול לימון ושום  " }],
      })
    ).toBe("100 גרם חזה עוף בגריל עם תיבול לימון ושום");
  });

  it("hides categories without item names", () => {
    expect(getVisibleDietV2Categories(plan.meals[0]).map(({ category }) => category)).toEqual([
      "protein",
    ]);
  });

  it("keeps a meal with empty categories and calorie data meaningful", () => {
    const calorieOnlyPlan: IDietPlanV2 = {
      ...plan,
      meals: [
        {
          name: "ארוחה ללא פריטים",
          categories: [],
          macros: { calories: 320, protein: 20, carbs: 30, fat: 8 },
          freeCalories: { calories: 75, description: "בחירה חופשית" },
        },
      ],
    };

    expect(isDietPlanV2(calorieOnlyPlan)).toBe(true);
    expect(getDietPlanContentState(calorieOnlyPlan)).toBe("ready");
    expect(computeDietPlanV2Totals(calorieOnlyPlan)).toEqual({
      calories: 320,
      protein: 20,
      carbs: 30,
      fat: 8,
      freeCalories: 75,
    });
  });

  it("detects meaningful V1 and V2 content", () => {
    expect(getDietPlanContentState({ meals: [] } as any)).toBe("empty");
    expect(getDietPlanContentState(plan)).toBe("ready");
    expect(getDietPlanContentState({ ...plan, meals: [], highlights: "" })).toBe("empty");
    expect(getDietPlanContentState({ ...plan, meals: [], highlights: "דגש" })).toBe("ready");
  });

  it("treats blank-only V2 highlights without meals as empty", () => {
    expect(getDietPlanContentState({ ...plan, meals: [], highlights: " \n\t " })).toBe("empty");
  });

  it("treats HTML-only V1 instructions and supplements as empty", () => {
    expect(
      getDietPlanContentState({
        meals: [],
        freeCalories: 0,
        customInstructions: ["<p><br></p>"],
        supplements: ["&nbsp;"],
      })
    ).toBe("empty");
  });
});
