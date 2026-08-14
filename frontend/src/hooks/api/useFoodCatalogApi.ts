import { fetchData, sendData } from "@/API/api";
import type { FoodCatalogLookupResult } from "@/interfaces/IFoodCatalog";
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

  return { lookupBarcode, reportConsumption };
};
