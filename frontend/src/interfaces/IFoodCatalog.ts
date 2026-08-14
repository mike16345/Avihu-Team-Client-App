export type FoodCatalogMeasurementUnit = "g" | "ml";

export interface FoodCatalogNutritionValues {
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
  saturatedFat: number | null;
  sugars: number | null;
  fiber: number | null;
  sodium: number | null;
  salt: number | null;
}

export interface FoodCatalogProduct {
  id: string;
  identifiers: {
    barcode: string | null;
    barcodeAliases: string[];
    providerId: string | null;
  };
  names: {
    he: string | null;
    en: string | null;
    original: string | null;
    originalLanguage: string | null;
  };
  brand: string | null;
  imageUrl: string | null;
  package: {
    description: string | null;
    quantity: number | null;
    unit: FoodCatalogMeasurementUnit | null;
  };
  serving: {
    description: string;
    quantity: number;
    unit: FoodCatalogMeasurementUnit;
    source: "open_food_facts" | "fallback_100";
  } | null;
  nutrition: {
    basisUnit: FoodCatalogMeasurementUnit | null;
    per100: FoodCatalogNutritionValues;
    perServing: FoodCatalogNutritionValues;
  };
  dataQuality: {
    status: "complete" | "partial";
    missingFields: string[];
    errors: string[];
    warnings: string[];
  };
  displayName: string | null;
  displayLanguage: "he" | "en" | "original" | null;
  hasAdminOverrides: boolean;
  analytics: {
    lookupCount: number;
    consumptionCount: number;
    lastLookedUpAt: string | null;
    lastConsumedAt: string | null;
  };
}

export interface FoodCatalogLookupResult {
  product: FoodCatalogProduct;
  cache: {
    status: "created" | "hit" | "refreshed" | "stale_fallback";
  };
}
