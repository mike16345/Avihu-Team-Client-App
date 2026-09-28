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
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export default useTrainerBlockBackgroundsQuery;
