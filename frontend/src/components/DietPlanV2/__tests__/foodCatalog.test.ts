import { describe, expect, it } from "vitest";
import {
  createFoodCatalogDraft,
  createSmartFoodEntry,
  createSmartFoodEntryDraft,
  replaceSmartFoodEntry,
  sumSmartFoodMacros,
  validateSmartFoodDraft,
} from "../foodCatalog";
import { getRemainingScanFeedbackMs } from "../foodCatalogScanner";
import {
  getDietPlanV2SmartFoodsHistoryDayKeys,
  getDietPlanV2SmartFoodsStorageKey,
  reconcileSmartFoodEntries,
} from "../smartFoodStorage";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";

const product: FoodCatalogProduct = {
  id: "catalog-1",
  identifiers: { barcode: "7290000000000", barcodeAliases: [], providerId: "7290000000000" },
  names: { he: "יוגורט", en: "Yogurt", original: "Yogurt", originalLanguage: "en" },
  brand: "Example",
  imageUrl: null,
  package: { description: "200 g", quantity: 200, unit: "g" },
  serving: { description: "100 g", quantity: 100, unit: "g", source: "open_food_facts" },
  nutrition: {
    basisUnit: "g",
    per100: {
      calories: 150,
      protein: 20,
      carbohydrates: 5,
      fat: 4,
      saturatedFat: 2,
      sugars: 3,
      fiber: 0,
      sodium: 0.1,
      salt: 0.25,
    },
    perServing: {
      calories: 150,
      protein: 20,
      carbohydrates: 5,
      fat: 4,
      saturatedFat: 2,
      sugars: 3,
      fiber: 0,
      sodium: 0.1,
      salt: 0.25,
    },
  },
  dataQuality: { status: "complete", missingFields: [], errors: [], warnings: [] },
  displayName: "יוגורט",
  displayLanguage: "he",
  hasAdminOverrides: false,
  analytics: {
    lookupCount: 1,
    consumptionCount: 0,
    lastLookedUpAt: null,
    lastConsumedAt: null,
  },
};

describe("Food Catalog recording", () => {
  it("prefills exactly one serving from the normalized catalog response", () => {
    expect(createFoodCatalogDraft(product)).toEqual({
      catalogItemId: "catalog-1",
      barcode: "7290000000000",
      name: "יוגורט",
      servingDescription: "100 g",
      servingCount: "1",
      calories: "150",
      protein: "20",
      carbs: "5",
      fat: "4",
    });
  });

  it("keeps missing nutrition editable instead of inventing values", () => {
    const draft = createFoodCatalogDraft({
      ...product,
      nutrition: {
        ...product.nutrition,
        perServing: {
          ...product.nutrition.perServing,
          calories: null,
          protein: null,
        },
      },
    });

    expect(draft.calories).toBe("");
    expect(draft.protein).toBe("");
  });

  it("limits catalog nutrition and recorded macro totals to two decimal places", () => {
    const draft = createFoodCatalogDraft({
      ...product,
      nutrition: {
        ...product.nutrition,
        perServing: {
          ...product.nutrition.perServing,
          calories: 124.999999,
          protein: 24.664838,
          carbohydrates: 5.5,
          fat: 4,
        },
      },
    });

    expect(draft).toMatchObject({
      calories: "125",
      protein: "24.66",
      carbs: "5.5",
      fat: "4",
    });

    expect(
      createSmartFoodEntry(
        { ...draft, servingCount: "1.333" },
        "entry-rounded",
        "2026-08-13T12:00:00.000Z"
      )?.macros
    ).toEqual({ calories: 166.63, protein: 32.87, carbs: 7.33, fat: 5.33 });
  });

  it("records editable per-serving macros multiplied by the serving count", () => {
    const entry = createSmartFoodEntry(
      {
        ...createFoodCatalogDraft(product),
        servingCount: "2.5",
        calories: "160",
      },
      "entry-1",
      "2026-08-13T12:00:00.000Z"
    );

    expect(entry).toMatchObject({
      id: "entry-1",
      catalogItemId: "catalog-1",
      servingCount: 2.5,
      macros: { calories: 400, protein: 50, carbs: 12.5, fat: 10 },
      recordedAt: "2026-08-13T12:00:00.000Z",
    });
  });

  it("reconstructs editable per-serving values without changing entry identity", () => {
    const entry = createSmartFoodEntry(
      {
        ...createFoodCatalogDraft(product),
        servingCount: "2",
        calories: "150.25",
        protein: "20.5",
      },
      "entry-1",
      "2026-08-13T12:00:00.000Z"
    )!;

    expect(createSmartFoodEntryDraft(entry)).toEqual({
      catalogItemId: "catalog-1",
      barcode: "7290000000000",
      name: "יוגורט",
      servingDescription: "100 g",
      servingCount: "2",
      calories: "150.25",
      protein: "20.5",
      carbs: "5",
      fat: "4",
    });

    const replacement = { ...entry, name: "יוגורט מעודכן" };
    expect(replaceSmartFoodEntry([entry], replacement)).toEqual([replacement]);
    expect(replaceSmartFoodEntry([entry], { ...replacement, id: "missing" })).toEqual([entry]);
  });

  it("keeps scan feedback visible for a minimum perceptible duration", () => {
    expect(getRemainingScanFeedbackMs(1_000, 1_100)).toBe(550);
    expect(getRemainingScanFeedbackMs(1_000, 1_800)).toBe(0);
  });

  it("allows blank optional macros as zero but rejects a missing name or invalid serving count", () => {
    const draft = createFoodCatalogDraft(product);

    expect(
      createSmartFoodEntry(
        { ...draft, calories: "", protein: "", carbs: "", fat: "" },
        "entry-1",
        "2026-08-13T12:00:00.000Z"
      )?.macros
    ).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    expect(
      createSmartFoodEntry({ ...draft, name: "   " }, "entry-2", "2026-08-13T12:00:00.000Z")
    ).toBeNull();
    expect(
      createSmartFoodEntry({ ...draft, servingCount: "0" }, "entry-3", "2026-08-13T12:00:00.000Z")
    ).toBeNull();
  });

  it("identifies each invalid draft field with a specific user-facing reason", () => {
    expect(
      validateSmartFoodDraft({
        ...createFoodCatalogDraft(product),
        name: "   ",
        servingCount: "0",
        calories: "-1",
        protein: "not-a-number",
        carbs: "",
      })
    ).toEqual({
      name: "יש להזין שם מוצר.",
      servingCount: "מספר המנות חייב להיות גדול מאפס.",
      calories: "הקלוריות חייבות להיות מספר חיובי או אפס.",
      protein: "החלבון חייב להיות מספר חיובי או אפס.",
    });
  });

  it("adds recorded foods to the V2 progress totals", () => {
    const first = createSmartFoodEntry(
      createFoodCatalogDraft(product),
      "entry-1",
      "2026-08-13T12:00:00.000Z"
    );
    const second = createSmartFoodEntry(
      { ...createFoodCatalogDraft(product), servingCount: "2" },
      "entry-2",
      "2026-08-13T13:00:00.000Z"
    );

    expect(sumSmartFoodMacros([first!, second!])).toEqual({
      calories: 450,
      protein: 60,
      carbs: 15,
      fat: 12,
      freeCalories: 0,
    });
  });

  it("persists smart foods by plan and logical diet day while dropping corrupt entries", () => {
    const plan = { _id: "plan-1", version: 2, meals: [], highlights: "" } as IDietPlanV2;
    const valid = createSmartFoodEntry(
      createFoodCatalogDraft(product),
      "entry-1",
      "2026-08-13T12:00:00.000Z"
    )!;

    expect(getDietPlanV2SmartFoodsStorageKey(plan, "2026-08-13")).toBe(
      "diet-plan-v2-smart-foods:plan:plan-1:2026-08-13"
    );
    expect(reconcileSmartFoodEntries([valid, { id: "broken" }, null])).toEqual([valid]);
    expect(reconcileSmartFoodEntries("not-an-array")).toEqual([]);
  });

  it("builds one seven-day history page at a time from the logical diet day", () => {
    expect(getDietPlanV2SmartFoodsHistoryDayKeys(new Date("2026-08-14T12:00:00Z"), 0)).toEqual([
      "2026-08-14",
      "2026-08-13",
      "2026-08-12",
      "2026-08-11",
      "2026-08-10",
      "2026-08-09",
      "2026-08-08",
    ]);
    expect(getDietPlanV2SmartFoodsHistoryDayKeys(new Date("2026-08-14T12:00:00Z"), 1)).toEqual([
      "2026-08-07",
      "2026-08-06",
      "2026-08-05",
      "2026-08-04",
      "2026-08-03",
      "2026-08-02",
      "2026-08-01",
    ]);
    expect(getDietPlanV2SmartFoodsHistoryDayKeys(new Date("2026-08-14T02:59:00Z"), 0)[0]).toBe(
      "2026-08-13"
    );
  });
});
