import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";
import { useUserStore } from "@/store/userStore";

export interface IMonthlyExerciseGoal {
  _id?: string;
  userId: string;
  exercise: string;
  targetWeight: number;
  targetReps: number;
  note?: string;
}

const KEY = "monthly-exercise-goals";

const useMonthlyExerciseGoals = () => {
  const userId = useUserStore((s) => s.currentUser?._id);

  return useQuery({
    queryFn: () =>
      fetchData<ApiResponse<IMonthlyExerciseGoal[]>>(
        `/monthlyExerciseGoals?userId=${userId}`
      ).then((res) => res.data ?? []),
    queryKey: [KEY, userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
  });
};

export default useMonthlyExerciseGoals;
