import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddRecordedSets, useRecordedSetsApi } from "../api/useRecordedSetsApi";
import { RECORDED_SETS_BY_USER_KEY, WORKOUT_SESSION_KEY } from "@/constants/reactQuery";
import { useUserStore } from "@/store/userStore";
import { SetInput } from "@/components/WorkoutPlan/RecordExercise/SetInputContainer";

export const useRecordedSetsMutations = () => {
  const userId = useUserStore((state) => state.currentUser?._id);
  const queryClient = useQueryClient();
  const { addRecordedSets, updateRecordedSet, deleteRecordedSet } = useRecordedSetsApi();

  const useAddRecordedSets = useMutation({
    mutationFn: ({
      recordedSets,
      sessionId,
    }: {
      recordedSets: AddRecordedSets;
      sessionId: string | undefined;
    }) => addRecordedSets(recordedSets, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECORDED_SETS_BY_USER_KEY + userId] });
      queryClient.invalidateQueries({ queryKey: [WORKOUT_SESSION_KEY] });
    },
  });

  const useUpdateRecordedSet = useMutation({
    mutationFn: ({ set, id, exercise }: { set: SetInput; id: string; exercise: string }) =>
      updateRecordedSet({ set, setId: id, userId, exercise }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECORDED_SETS_BY_USER_KEY + userId] });
    },
  });

  const useDeleteRecordedSet = useMutation({
    mutationFn: deleteRecordedSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECORDED_SETS_BY_USER_KEY + userId] });
    },
  });

  return { useAddRecordedSets, useUpdateRecordedSet, useDeleteRecordedSet };
};
