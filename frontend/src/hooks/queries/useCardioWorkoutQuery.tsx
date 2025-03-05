import { useQuery } from "@tanstack/react-query";
import { useCardioWorkoutApi } from "../api/useCardioWorkoutApi";
import { ICardioExerciseItem } from "@/interfaces/Workout";
import { ApiResponse } from "@/types/ApiTypes";
import { CARDIO_WORKOUT, ONE_DAY } from "@/constants/reactQuery";

const useCardioWorkoutQuery = () => {
  const { getAllCardioWrkouts } = useCardioWorkoutApi();

  return useQuery<any, any, ApiResponse<ICardioExerciseItem[]>, any>({
    queryFn: () => getAllCardioWrkouts(),
    queryKey: [CARDIO_WORKOUT],
    staleTime: ONE_DAY,
  });
};

export default useCardioWorkoutQuery;
