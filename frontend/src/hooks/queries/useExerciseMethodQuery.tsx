import { useQuery } from "@tanstack/react-query";
import { EXERCISE_METHOD, ONE_DAY } from "@/constants/reactQuery";
import useExerciseMethodApi from "../api/useExerciseMethodsApi";
import { IExerciseMethod } from "@/interfaces/Workout";
import { ApiResponse } from "@/types/ApiTypes";

const useExerciseMethodQuery = (exerciseMethod: string | null) => {
  const { getExerciseMethodByName } = useExerciseMethodApi();

  return useQuery<any, any, ApiResponse<IExerciseMethod>, any>({
    queryFn: () => getExerciseMethodByName(exerciseMethod || ``),
    queryKey: [EXERCISE_METHOD + exerciseMethod],
    enabled: !!exerciseMethod,
    staleTime: ONE_DAY,
  });
};

export default useExerciseMethodQuery;
