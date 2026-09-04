export const normalizeFoodCatalogSearchQuery = (value: string): string =>
  value.trim().replace(/\s+/g, " ");

export const shouldRequestFoodCatalogSearch = (value: string): boolean => {
  const normalized = normalizeFoodCatalogSearchQuery(value);
  return normalized.length === 0 || normalized.length >= 2;
};

interface FoodCatalogSearchPresentationInput {
  inputQuery: string;
  requestedQuery: string;
  productCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

export const getFoodCatalogSearchPresentation = ({
  inputQuery,
  requestedQuery,
  productCount,
  isLoading,
  isFetching,
  isError,
}: FoodCatalogSearchPresentationInput) => {
  const normalizedQuery = normalizeFoodCatalogSearchQuery(inputQuery);
  const normalizedRequestedQuery = normalizeFoodCatalogSearchQuery(requestedQuery);
  const hasQuery = normalizedQuery.length > 0;
  const queryIsValid = shouldRequestFoodCatalogSearch(normalizedQuery);
  const isSettling = normalizedQuery !== normalizedRequestedQuery;
  const hasProducts = productCount > 0;
  const showTooShort = hasQuery && !queryIsValid;

  return {
    normalizedQuery,
    hasQuery,
    queryIsValid,
    isSettling,
    showTooShort,
    showLoading: !showTooShort && !hasProducts && (isSettling || isLoading),
    showRefreshing: !showTooShort && hasProducts && (isSettling || isFetching),
    showError: !showTooShort && !hasProducts && !isSettling && isError,
    showEmpty: !showTooShort && !isLoading && !isError && !isSettling && !hasProducts,
    showProducts: !showTooShort && hasProducts,
  };
};
