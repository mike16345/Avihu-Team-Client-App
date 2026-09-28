import { fetchData } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";
import { IBlockBackground } from "@/interfaces/Workout";

export const useTrainerBlockBackgroundsApi = () => {
  const TRAINER_BLOCK_BG_API = `/trainers/block-backgrounds`;

  const getTrainerBlockBackgrounds = (trainerId: string) =>
    fetchData<ApiResponse<IBlockBackground[]>>(
      `${TRAINER_BLOCK_BG_API}?trainerId=${trainerId}`
    );

  return {
    getTrainerBlockBackgrounds,
  };
};
