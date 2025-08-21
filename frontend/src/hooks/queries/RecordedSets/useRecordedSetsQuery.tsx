import { useQuery } from "@tanstack/react-query";
import { ONE_DAY, RECORDED_SETS_BY_USER_KEY } from "@/constants/reactQuery";
import { useUserStore } from "@/store/userStore";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { IMuscleGroupRecordedSets } from "@/interfaces/Workout";

const useRecordedSetsQuery = () => {
  const { getRecordedSetsByUserId } = useRecordedSetsApi();
  const currentUser = useUserStore((state) => state.currentUser);

  return useQuery<any, any, IMuscleGroupRecordedSets[], any>({
    queryFn: () => getRecordedSetsByUserId(currentUser?._id || ""),
    queryKey: [RECORDED_SETS_BY_USER_KEY + currentUser?._id],
    enabled: !!currentUser,
    staleTime: ONE_DAY,
  });
};

export default useRecordedSetsQuery;
