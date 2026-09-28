import { useQuery } from "@tanstack/react-query";
import { useTrainerBlockBackgroundsApi } from "../api/useTrainerBlockBackgroundsApi";
import { IBlockBackground } from "@/interfaces/Workout";
import { ApiResponse } from "@/types/ApiTypes";
import { ONE_DAY, TRAINER_BLOCK_BACKGROUNDS } from "@/constants/reactQuery";

const useTrainerBlockBackgroundsQuery = (trainerId?: string) => {
  const { getTrainerBlockBackgrounds } = useTrainerBlockBackgroundsApi();

  return useQuery<
    ApiResponse<IBlockBackground[]>,
    Error,
    ApiResponse<IBlockBackground[]>,
    readonly [string, string | undefined]
  >({
    queryFn: () => getTrainerBlockBackgrounds(trainerId ?? ""),
    queryKey: [TRAINER_BLOCK_BACKGROUNDS, trainerId] as const,
    staleTime: ONE_DAY,
  });
};

export default useTrainerBlockBackgroundsQuery;
