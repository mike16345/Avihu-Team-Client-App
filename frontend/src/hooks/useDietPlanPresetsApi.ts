import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IDietPlanPreset } from "@/interfaces/IDietPlan";

const DIET_PLAN_PRESET_ENDPOINT = "presets/dietPlans/";

export const useDietPlanPresetApi = () => {
  const addDietPlanPreset = (dietPlan: IDietPlanPreset) => sendData<IDietPlanPreset>(DIET_PLAN_PRESET_ENDPOINT, dietPlan);

  const updateDietPlanPreset = (planId: string, dietPlan: IDietPlanPreset) => updateItem(`${DIET_PLAN_PRESET_ENDPOINT}${planId}`, dietPlan);

  const deleteDietPlanPreset = (planId: string) => deleteItem(DIET_PLAN_PRESET_ENDPOINT, planId);

  const getDietPlanPreset = (id: string) => fetchData<IDietPlanPreset>(DIET_PLAN_PRESET_ENDPOINT + id);

  const getAllDietPlanPresets = () => fetchData<IDietPlanPreset[]>(DIET_PLAN_PRESET_ENDPOINT);

  return {
    addDietPlanPreset,
    updateDietPlanPreset,
    deleteDietPlanPreset,
    getDietPlanPreset,
    getAllDietPlanPresets
  };
};
