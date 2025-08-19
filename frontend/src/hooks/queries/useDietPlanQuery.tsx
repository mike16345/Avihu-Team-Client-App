import { DIET_PLAN_KEY, ONE_DAY } from "@/constants/reactQuery";
import { createRetryFunction } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useDietPlanApi } from "../api/useDietPlanApi";
import { useUserStore } from "@/store/userStore";

const useDietPlanQuery = () => {
  const currentUser = useUserStore((store) => store.currentUser);
  const { getDietPlanByUserId } = useDietPlanApi();

  return useQuery({
    queryFn: () => getDietPlanByUserId(currentUser?._id!),
    queryKey: [DIET_PLAN_KEY + currentUser?._id],
    enabled: !!currentUser?._id,
    staleTime: ONE_DAY,
    retry: createRetryFunction(404, 2),
  });
};

export default useDietPlanQuery;
