export const normalizeFoodCatalogSearchQuery = (value: string): string =>
  value.trim().replace(/\s+/g, " ");

export const shouldRequestFoodCatalogSearch = (value: string): boolean => {
  const normalized = normalizeFoodCatalogSearchQuery(value);
  return normalized.length === 0 || normalized.length >= 2;
};
