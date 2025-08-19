import { useQuery } from "@tanstack/react-query";
import { ICompleteWorkoutPlan } from "@/interfaces/Workout";
import { ONE_DAY, WORKOUT_PLAN_KEY } from "@/constants/reactQuery";
import { useWorkoutPlanApi } from "../api/useWorkoutPlanApi";
import { useUserStore } from "@/store/userStore";

const useWorkoutPlanQuery = () => {
  const { getWorkoutPlanByUserId } = useWorkoutPlanApi();
  const { currentUser } = useUserStore();

  return useQuery<any, any, ICompleteWorkoutPlan, any>({
    queryFn: () => getWorkoutPlanByUserId(currentUser?._id || ""),
    enabled: !!currentUser,
    queryKey: [WORKOUT_PLAN_KEY + currentUser?._id],
    staleTime: ONE_DAY,
  });
};

export default useWorkoutPlanQuery;
