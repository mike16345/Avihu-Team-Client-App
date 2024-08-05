import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";

const WORKOUT_PLAN_PRESETS_ENDPOINT = "presets/workoutPlans/";

export const useWorkoutPlanPresetApi = () => {
  const getAllWorkoutPlanPresets = () =>
    fetchData<IWorkoutPlanPreset[]>(WORKOUT_PLAN_PRESETS_ENDPOINT);

  const getWorkoutPlanPresetById = (presetID: string) =>
    fetchData<IWorkoutPlanPreset>(WORKOUT_PLAN_PRESETS_ENDPOINT + presetID);

  const addWorkoutPlanPreset = (workoutPlan: IWorkoutPlanPreset) =>
    sendData<IWorkoutPlanPreset>(WORKOUT_PLAN_PRESETS_ENDPOINT, workoutPlan);

  const deleteWorkoutPlanPreset = (presetID: string) =>
    deleteItem(WORKOUT_PLAN_PRESETS_ENDPOINT, presetID);
  
  const updateWorkoutPlanPreset = (presetID: string, workoutPlanPreset: IWorkoutPlanPreset) =>
    updateItem(WORKOUT_PLAN_PRESETS_ENDPOINT + presetID, workoutPlanPreset);

  return {
    getAllWorkoutPlanPresets,
    addWorkoutPlanPreset,
    deleteWorkoutPlanPreset,
    getWorkoutPlanPresetById,
    updateWorkoutPlanPreset,
  };
};
