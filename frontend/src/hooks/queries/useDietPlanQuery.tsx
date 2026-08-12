import { DIET_PLAN_KEY, ONE_DAY } from "@/constants/reactQuery";
import type { IDietPlan } from "@/interfaces/DietPlan";
import type { AnyDietPlan } from "@/interfaces/DietPlanTypes";
import { useUserStore } from "@/store/userStore";
import { createRetryFunction } from "@/utils/utils";
import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { useDietPlanApi } from "../api/useDietPlanApi";

export const getDietPlanQueryOptions = (
  userId: string,
  getDietPlanByUserId: (userId: string) => Promise<AnyDietPlan>
): UseQueryOptions<AnyDietPlan, unknown, AnyDietPlan, string[]> => ({
  queryFn: () => getDietPlanByUserId(userId),
  queryKey: [DIET_PLAN_KEY + userId],
  staleTime: ONE_DAY,
  retry: createRetryFunction(404, 2),
});

const useDietPlanQuery = <TPlan extends AnyDietPlan = IDietPlan>(): UseQueryResult<
  TPlan,
  unknown
> => {
  const currentUser = useUserStore((store) => store.currentUser);
  const { getDietPlanByUserId } = useDietPlanApi();

  return useQuery({
    ...getDietPlanQueryOptions(currentUser?._id || "", getDietPlanByUserId),
    enabled: !!currentUser?._id,
  }) as UseQueryResult<TPlan, unknown>;
};

export default useDietPlanQuery;
