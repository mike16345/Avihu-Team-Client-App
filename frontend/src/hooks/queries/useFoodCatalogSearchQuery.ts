import { useQuery } from "@tanstack/react-query";
import { FOOD_CATALOG_SEARCH_KEY, ONE_HOUR } from "@/constants/reactQuery";
import { useFoodCatalogApi } from "@/hooks/api/useFoodCatalogApi";
import {
  normalizeFoodCatalogSearchQuery,
  shouldRequestFoodCatalogSearch,
} from "@/components/DietPlanV2/foodCatalogSearch";

const TEN_MINUTES = 10 * 60 * 1000;

const useFoodCatalogSearchQuery = (query: string, enabled = true) => {
  const { searchCatalog } = useFoodCatalogApi();
  const normalizedQuery = normalizeFoodCatalogSearchQuery(query);

  return useQuery({
    queryKey: [FOOD_CATALOG_SEARCH_KEY, normalizedQuery || "popular"],
    queryFn: () => searchCatalog(normalizedQuery),
    enabled: enabled && shouldRequestFoodCatalogSearch(normalizedQuery),
    staleTime: TEN_MINUTES,
    gcTime: ONE_HOUR,
    retry: 1,
  });
};

export default useFoodCatalogSearchQuery;
