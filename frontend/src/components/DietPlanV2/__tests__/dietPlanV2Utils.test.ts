import { describe, expect, it } from "vitest";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import {
  computeDietPlanV2Totals,
  formatDietV2CategoryItems,
  getDietPlanContentState,
  getVisibleDietV2Categories,
  isDietPlanV2,
  resolveDietPlanVersion,
} from "../dietPlanV2Utils";

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

  it("rejects a malformed V2 payload at the V2 type boundary", () => {
    expect(isDietPlanV2({ version: 2, meals: [], highlights: "" })).toBe(true);
    expect(isDietPlanV2({ version: 2, meals: [{ name: "broken" }], highlights: "" })).toBe(false);
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

  it("hides categories without item names", () => {
    expect(getVisibleDietV2Categories(plan.meals[0]).map(({ category }) => category)).toEqual([
      "protein",
    ]);
  });

  it("detects meaningful V1 and V2 content", () => {
    expect(getDietPlanContentState({ meals: [] } as any)).toBe("empty");
    expect(getDietPlanContentState(plan)).toBe("ready");
    expect(getDietPlanContentState({ ...plan, meals: [], highlights: "" })).toBe("empty");
    expect(getDietPlanContentState({ ...plan, meals: [], highlights: "דגש" })).toBe("ready");
  });
});
