import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { ICompleteWorkoutPlan } from "@/interfaces/Workout";
import { ONE_DAY, WORKOUT_PLAN_KEY } from "@/constants/reactQuery";
import { useWorkoutPlanApi } from "../api/useWorkoutPlanApi";
import { useUserStore } from "@/store/userStore";
import { createRetryFunction } from "@/utils/utils";

export const getWorkoutPlanQueryOptions = (
  userId: string,
  getWorkoutPlanByUserId: (userId: string) => Promise<ICompleteWorkoutPlan>
): UseQueryOptions<any, any, ICompleteWorkoutPlan, any> => ({
  queryFn: () => getWorkoutPlanByUserId(userId),
  queryKey: [WORKOUT_PLAN_KEY + userId],
  staleTime: ONE_DAY,
  retry: createRetryFunction(404, 2),
});

const useWorkoutPlanQuery = () => {
  const { getWorkoutPlanByUserId } = useWorkoutPlanApi();
  const { currentUser } = useUserStore();

  return useQuery<any, any, ICompleteWorkoutPlan, any>({
    ...getWorkoutPlanQueryOptions(currentUser?._id || "", getWorkoutPlanByUserId),
    enabled: !!currentUser?._id,
  });
};

export default useWorkoutPlanQuery;
