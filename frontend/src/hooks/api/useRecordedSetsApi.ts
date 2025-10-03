import { fetchData, sendData, updateItem, deleteItem } from "@/API/api";
import { IMuscleGroupRecordedSets, IRecordedSetResponse } from "@/interfaces/Workout";
import { SetInput } from "@/schemas/setSchema";
import { ApiResponse } from "@/types/ApiTypes";

const RECORDED_SETS_ENDPOINT = "recordedSets";

export interface AddRecordedSets {
  userId: string;
  recordedSets: (SetInput & { plan: string })[];
  muscleGroup: string;
  exercise: string;
}

export const useRecordedSetsApi = () => {
  const addRecordedSets = (recordedSets: AddRecordedSets, sessionId: string = "") => {
    return sendData<IRecordedSetResponse>(
      RECORDED_SETS_ENDPOINT + "?sessionId=" + sessionId,
      recordedSets
    );
  };

  const updateRecordedSet = (recordedSet: any) => {
    const endpoint = RECORDED_SETS_ENDPOINT + "/one";

    return updateItem(endpoint, recordedSet);
  };

  const getRecordedSetsByUserId = (id: string) => {
    const endpoint = `${RECORDED_SETS_ENDPOINT}/user?userId=${id}`;

    return fetchData<ApiResponse<IMuscleGroupRecordedSets[]>>(endpoint).then((res) => res.data);
  };

  const getUserRecordedMuscleGroupNames = (id: string) => {
    const endpoint = RECORDED_SETS_ENDPOINT + "/user/" + id + "/names/muscleGroups";

    return fetchData<string[]>(endpoint);
  };

  const getUserRecordedExerciseNamesByMuscleGroup = (id: string, group: string) => {
    const endpoint = RECORDED_SETS_ENDPOINT + "/user/" + id + "/names";

    return fetchData<string[]>(endpoint, { muscleGroup: group });
  };

  const getUserRecordedSetsByExercise = (exercise: string, muscleGroup: string, userId: string) => {
    const endpoint =
      RECORDED_SETS_ENDPOINT +
      "/user/exercise?exercise=" +
      exercise +
      "&userId=" +
      userId +
      "&muscleGroup=" +
      muscleGroup;

    return fetchData<ApiResponse<IRecordedSetResponse[]>>(endpoint);
  };

  const deleteRecordedSet = (setToDelete: Partial<AddRecordedSets> & { setId: string }) => {
    return deleteItem(RECORDED_SETS_ENDPOINT + "/one", undefined, undefined, setToDelete);
  };

  return {
    addRecordedSets,
    updateRecordedSet,
    getRecordedSetsByUserId,
    getUserRecordedMuscleGroupNames,
    getUserRecordedExerciseNamesByMuscleGroup,
    getUserRecordedSetsByExercise,
    deleteRecordedSet,
  };
};
