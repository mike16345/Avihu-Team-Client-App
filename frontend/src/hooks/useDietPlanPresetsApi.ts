import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IDietPlanPreset } from "@/interfaces/DietPlan";
import { ApiResponse } from "@/types/ApiTypes";

const DIET_PLAN_PRESET_ENDPOINT = "presets/dietPlans/";

export const useDietPlanPresetApi = () => {
  const addDietPlanPreset = (dietPlan: IDietPlanPreset) =>
    sendData<ApiResponse<IDietPlanPreset>>(DIET_PLAN_PRESET_ENDPOINT, dietPlan);

  const updateDietPlanPreset = (planId: string, dietPlan: IDietPlanPreset) =>
    updateItem(`${DIET_PLAN_PRESET_ENDPOINT}/one?id=${planId}`, dietPlan);

  const deleteDietPlanPreset = (planId: string) =>
    deleteItem(`${DIET_PLAN_PRESET_ENDPOINT}/one?id=${planId}`);

  const getDietPlanPreset = (id: string) =>
    fetchData<ApiResponse<IDietPlanPreset>>(`${DIET_PLAN_PRESET_ENDPOINT}/one?id=${id}`);

  const getAllDietPlanPresets = () =>
    fetchData<ApiResponse<IDietPlanPreset[]>>(DIET_PLAN_PRESET_ENDPOINT);

  return {
    addDietPlanPreset,
    updateDietPlanPreset,
    deleteDietPlanPreset,
    getDietPlanPreset,
    getAllDietPlanPresets,
  };
};
