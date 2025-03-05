import { fetchData } from "@/API/api";
import { ICardioExerciseItem } from "@/interfaces/Workout";
import { ApiResponse } from "@/types/ApiTypes";

export const useCardioWorkoutApi = () => {
  const CARDIO_WORKOUT_PRESETS_API = `/presets/cardioWorkout`;

  const getAllCardioWrkouts = () =>
    fetchData<ApiResponse<ICardioExerciseItem[]>>(CARDIO_WORKOUT_PRESETS_API);

  return {
    getAllCardioWrkouts,
  };
};
