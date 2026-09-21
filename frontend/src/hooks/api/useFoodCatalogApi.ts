import { fetchData, sendData } from "@/API/api";
import type { FoodCatalogLookupResult, FoodCatalogSearchResult } from "@/interfaces/IFoodCatalog";
import type { ApiResponse } from "@/types/ApiTypes";

const FOOD_CATALOG_ENDPOINT = "foodCatalog";

export const useFoodCatalogApi = () => {
  const lookupBarcode = (barcode: string) =>
    fetchData<ApiResponse<FoodCatalogLookupResult>>(`${FOOD_CATALOG_ENDPOINT}/barcode`, {
      barcode,
    }).then(({ data }) => data);

  const reportConsumption = (catalogItemId: string) =>
    sendData<ApiResponse<{ id: string }>>(
      `${FOOD_CATALOG_ENDPOINT}/consumption?id=${encodeURIComponent(catalogItemId)}`,
      {}
    ).then(({ data }) => data);

  const searchCatalog = (query: string) =>
    fetchData<ApiResponse<FoodCatalogSearchResult>>(`${FOOD_CATALOG_ENDPOINT}/search`, {
      q: query,
    }).then(({ data }) => data);

  return { lookupBarcode, reportConsumption, searchCatalog };
};
