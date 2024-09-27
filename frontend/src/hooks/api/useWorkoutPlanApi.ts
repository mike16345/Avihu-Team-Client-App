import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IDetailedWorkoutPlan } from "@/interfaces/Workout";
import { ApiResponse } from "@/types/ApiTypes";

const WORKOUT_PLAN_ENDPOINT = "workoutPlans/";

export const useWorkoutPlanApi = () => {
  const addWorkoutPlan = (userId: string, workoutPlan: IDetailedWorkoutPlan) => {
    return sendData<IDetailedWorkoutPlan>(WORKOUT_PLAN_ENDPOINT, workoutPlan, { id: userId });
  };

  const updateWorkoutPlan = (userId: string, workoutPlan: IDetailedWorkoutPlan) =>
    updateItem(`${WORKOUT_PLAN_ENDPOINT}/one`, workoutPlan, null, { userId });

  const updateWorkoutPlanByUserId = (userId: string, workoutPlan: IDetailedWorkoutPlan) =>
    updateItem(`${WORKOUT_PLAN_ENDPOINT}/one/user`, workoutPlan, null, { userId });

  const deleteWorkoutPlan = (userId: string) =>
    deleteItem(`${WORKOUT_PLAN_ENDPOINT}/one`, { userId });

  const getWorkoutPlanByUserId = (userId: string) =>
    fetchData<ApiResponse<IDetailedWorkoutPlan>>(`${WORKOUT_PLAN_ENDPOINT}/user`, { userId });

  const getWorkoutPlan = (id: string) =>
    fetchData<IDetailedWorkoutPlan>(WORKOUT_PLAN_ENDPOINT + id);

  return {
    getWorkoutPlan,
    getWorkoutPlanByUserId,
    deleteWorkoutPlan,
    updateWorkoutPlanByUserId,
    updateWorkoutPlan,
    addWorkoutPlan,
  };
};
