import { fetchData } from "@/API/api";
import { ICompleteWorkoutPlan } from "@/interfaces/Workout";
import { ApiResponse } from "@/types/ApiTypes";

const WORKOUT_PLAN_ENDPOINT = "workoutPlans";

export const useWorkoutPlanApi = () => {
  const getWorkoutPlanByUserId = (userId: string) =>
    fetchData<ApiResponse<ICompleteWorkoutPlan>>(`${WORKOUT_PLAN_ENDPOINT}/user`, { userId }).then(
      (res) => {
        return res.data;
      }
    );

  const getWorkoutPlan = (id: string) =>
    fetchData<ApiResponse<ICompleteWorkoutPlan>>(WORKOUT_PLAN_ENDPOINT + id);

  return {
    getWorkoutPlan,
    getWorkoutPlanByUserId,
  };
};
