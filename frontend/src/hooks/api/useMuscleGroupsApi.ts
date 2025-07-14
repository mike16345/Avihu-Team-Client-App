import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import { IMuscleGroupItem } from "@/interfaces/IWorkoutPlan";

const useMuscleGroupsApi = () => {
  const MUSCLEGROUP_PRESETS_API = `/presets/muscleGroups/`;

  const getAllMuscleGroups = () => fetchData<IMuscleGroupItem[]>(MUSCLEGROUP_PRESETS_API);

  const getMuscleGroupById = (id: string) =>
    fetchData<IMuscleGroupItem>(MUSCLEGROUP_PRESETS_API + id);

  const updateMuscleGroup = (id: string, newExercise: IMuscleGroupItem) =>
    updateItem(MUSCLEGROUP_PRESETS_API + id, newExercise);

  const addMuscleGroup = (newExercise: IMuscleGroupItem) =>
    sendData<IMuscleGroupItem>(MUSCLEGROUP_PRESETS_API, newExercise);

  const deleteMuscleGroup = (id: string) => deleteItem(MUSCLEGROUP_PRESETS_API, id);

  return {
    getAllMuscleGroups,
    getMuscleGroupById,
    updateMuscleGroup,
    addMuscleGroup,
    deleteMuscleGroup,
  };
};

export default useMuscleGroupsApi;
