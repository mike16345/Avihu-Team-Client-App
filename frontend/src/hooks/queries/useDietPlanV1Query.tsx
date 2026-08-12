import { selectDietPlanV1 } from "@/components/DietPlanV2/dietPlanV2Utils";
import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import type { IDietPlan } from "@/interfaces/DietPlan";
import type { AnyDietPlan } from "@/interfaces/DietPlanTypes";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";
import { getDietPlanQueryOptions } from "./useDietPlanQuery";

const useDietPlanV1Query = () => {
  const currentUser = useUserStore((store) => store.currentUser);
  const { getDietPlanByUserId } = useDietPlanApi();

  return useQuery<AnyDietPlan, unknown, IDietPlan | undefined, string[]>({
    ...getDietPlanQueryOptions(currentUser?._id || "", getDietPlanByUserId),
    enabled: !!currentUser?._id,
    select: selectDietPlanV1,
  });
};

export default useDietPlanV1Query;
