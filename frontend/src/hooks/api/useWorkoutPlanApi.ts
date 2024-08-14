import { fetchData, sendData, updateItem } from "@/API/api";
import { ICompleteWorkoutPlan } from "../interfaces/Workout";

const WORKOUT_PLAN_ENDPOINT = "workoutPlans/";

export const useWorkoutPlanApi = () => {
  const getWorkoutPlanByUserId = (userID: string) =>
    fetchData<ICompleteWorkoutPlan>(`${WORKOUT_PLAN_ENDPOINT}user/${userID}`);

  const getWorkoutPlan = (id: string) =>
    fetchData<ICompleteWorkoutPlan>(WORKOUT_PLAN_ENDPOINT + id);

  return {
    getWorkoutPlan,
    getWorkoutPlanByUserId,
  };
};
