import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IExerciseMethod } from "@/interfaces/Workout";
import { ApiResponse } from "@/types/ApiTypes";

const useExerciseMethodApi = () => {
  const EXERCISE_METHODS_PRESETS_API = `presets/exerciseMethods`;

  const getExerciseMethodByName = (name:string) =>
    fetchData<ApiResponse<IExerciseMethod>>(EXERCISE_METHODS_PRESETS_API + `/name`, { name });

  const getExerciseMethodById = (id: string) =>
    fetchData<ApiResponse<IExerciseMethod>>(EXERCISE_METHODS_PRESETS_API + `/one`, { id: id });

  const updateExerciseMethod = (id: string, newExerciseMethod: IExerciseMethod) =>
    updateItem(EXERCISE_METHODS_PRESETS_API + `/one`, newExerciseMethod, null, { id });

  const addExerciseMethod = (newExerciseMethod: IExerciseMethod) =>
    sendData<IExerciseMethod>(EXERCISE_METHODS_PRESETS_API, newExerciseMethod);

  const addManyExerciseMethod = (newExerciseMethods: IExerciseMethod[]) =>
    sendData<IExerciseMethod[]>(EXERCISE_METHODS_PRESETS_API+`/many`, newExerciseMethods);

  const deleteExerciseMethod = (id: string) => deleteItem(EXERCISE_METHODS_PRESETS_API + `/one`, { id });

  return {
    getExerciseMethodByName,
    getExerciseMethodById,
    updateExerciseMethod,
    addExerciseMethod,
    deleteExerciseMethod,
    addManyExerciseMethod
  };
};

export default useExerciseMethodApi;