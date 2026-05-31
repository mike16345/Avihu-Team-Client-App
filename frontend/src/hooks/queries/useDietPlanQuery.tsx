import { DIET_PLAN_KEY, ONE_DAY } from "@/constants/reactQuery";
import { createRetryFunction } from "@/utils/utils";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useDietPlanApi } from "../api/useDietPlanApi";
import { useUserStore } from "@/store/userStore";

export const getDietPlanQueryOptions = (
  userId: string,
  getDietPlanByUserId: (userId: string) => Promise<any>
): UseQueryOptions<any, any, any, any> => ({
  queryFn: () => getDietPlanByUserId(userId),
  queryKey: [DIET_PLAN_KEY + userId],
  staleTime: ONE_DAY,
  retry: createRetryFunction(404, 2),
});

const useDietPlanQuery = () => {
  const currentUser = useUserStore((store) => store.currentUser);
  const { getDietPlanByUserId } = useDietPlanApi();

  return useQuery({
    ...getDietPlanQueryOptions(currentUser?._id || "", getDietPlanByUserId),
    enabled: !!currentUser?._id,
  });
};

export default useDietPlanQuery;
