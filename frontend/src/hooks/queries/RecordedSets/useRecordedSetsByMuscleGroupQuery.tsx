import { ONE_DAY, RECORDED_SETS_BY_USER_KEY } from "@/constants/reactQuery";
import { useRecordedSetsApi } from "@/hooks/api/useRecordedSetsApi";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const useRecordedSetsByMuscleGroupQuery = (exercise: string, muscleGroup: string) => {
  const userId = useUserStore((state) => state.currentUser?._id);
  const { getUserRecordedSetsByExercise } = useRecordedSetsApi();

  return useQuery({
    queryKey: [`${RECORDED_SETS_BY_USER_KEY}${userId}-${muscleGroup}-${exercise}`],
    queryFn: () => getUserRecordedSetsByExercise(exercise, muscleGroup, userId!),
    enabled: !!exercise && !!muscleGroup && !!userId,
    staleTime: ONE_DAY,
  });
};

export default useRecordedSetsByMuscleGroupQuery;
