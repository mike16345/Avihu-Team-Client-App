import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IExercisePresetItem } from "@/interfaces/IWorkoutPlan";

const EXERCISE_PRESETS_ENDPOINT = "presets/exercises/";


const useExercisePresetApi = () => {
    const getExercisePresets = () => fetchData<IExercisePresetItem[]>(EXERCISE_PRESETS_ENDPOINT)

    const getExerciseById = (id: string) => fetchData<IExercisePresetItem>(EXERCISE_PRESETS_ENDPOINT + id)

    const getExerciseByMuscleGroup = (muscleGroup: string) => fetchData<IExercisePresetItem[]>(EXERCISE_PRESETS_ENDPOINT + `/1/` + muscleGroup)

    const updateExercise = (id: string, newExercise: IExercisePresetItem) => updateItem(EXERCISE_PRESETS_ENDPOINT + id, newExercise)

    const addExercise = (newExercise: IExercisePresetItem) => sendData<IExercisePresetItem>(EXERCISE_PRESETS_ENDPOINT, newExercise)
    const deleteExercise = (id: string) => deleteItem(EXERCISE_PRESETS_ENDPOINT, id)

    return {
        getExercisePresets,
        getExerciseById,
        updateExercise,
        addExercise,
        deleteExercise,
        getExerciseByMuscleGroup
    }
}

export default useExercisePresetApi
