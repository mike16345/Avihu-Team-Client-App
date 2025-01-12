import { fetchData, sendData, updateItem } from "@/API/api";
import { IMuscleGroupRecordedSets, IRecordedSet, IRecordedSetResponse } from "@/interfaces/Workout";
import { IRecordedSetPost } from "@/interfaces/Workout";
import { ApiResponse } from "@/types/ApiTypes";

const RECORDED_SETS_ENDPOINT = "recordedSets";

export const useRecordedSetsApi = () => {
  const addRecordedSet = (recordedSet: IRecordedSetPost, sessionId: string = "") => {
    return sendData<IRecordedSetResponse>(
      RECORDED_SETS_ENDPOINT + "?sessionId=" + sessionId,
      recordedSet
    );
  };

  const updateRecordedSet = (id: string, recordedSet: IRecordedSet) => {
    const endpoint = RECORDED_SETS_ENDPOINT + "/" + id;

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

  return {
    addRecordedSet,
    updateRecordedSet,
    getRecordedSetsByUserId,
    getUserRecordedMuscleGroupNames,
    getUserRecordedExerciseNamesByMuscleGroup,
    getUserRecordedSetsByExercise,
  };
};
