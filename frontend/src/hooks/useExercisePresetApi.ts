import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { ApiResponse } from "@/types/ApiTypes";

const EXERCISE_PRESETS_ENDPOINT = "presets/exercises/";

const useExercisePresetApi = () => {
  const getExercisePresets = () =>
    fetchData<ApiResponse<IExercisePresetItem[]>>(EXERCISE_PRESETS_ENDPOINT);

  const getExerciseById = (id: string) =>
    fetchData<ApiResponse<IExercisePresetItem>>(EXERCISE_PRESETS_ENDPOINT + `/one`, { id });

  const getExerciseByMuscleGroup = (muscleGroup: string) =>
    fetchData<ApiResponse<IExercisePresetItem[]>>(EXERCISE_PRESETS_ENDPOINT + `/muscleGroup`, {
      muscleGroup,
    });

  const updateExercise = (id: string, newExercise: IExercisePresetItem) =>
    updateItem(EXERCISE_PRESETS_ENDPOINT + `/one`, newExercise, null, { id });

  const addExercise = (newExercise: IExercisePresetItem) =>
    sendData<IExercisePresetItem>(EXERCISE_PRESETS_ENDPOINT, newExercise);

  const deleteExercise = (id: string) => deleteItem(EXERCISE_PRESETS_ENDPOINT + `/one`, { id });

  return {
    getExercisePresets,
    getExerciseById,
    updateExercise,
    addExercise,
    deleteExercise,
    getExerciseByMuscleGroup,
  };
};

export default useExercisePresetApi;
