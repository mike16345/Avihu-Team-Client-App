import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRecordedSetsApi } from "../api/useRecordedSetsApi";
import { RECORDED_SETS_BY_USER_KEY } from "@/constants/reactQuery";
import { useUserStore } from "@/store/userStore";
import { SetInput } from "@/components/WorkoutPlan/RecordExercise/SetInputContainer";

export const useRecordedSetsMutations = () => {
  const userId = useUserStore((state) => state.currentUser?._id);
  const queryClient = useQueryClient();
  const { addRecordedSets, updateRecordedSet, deleteRecordedSet } = useRecordedSetsApi();

  const useAddRecordedSets = useMutation({
    mutationFn: addRecordedSets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECORDED_SETS_BY_USER_KEY + userId] });
    },
  });

  const useUpdateRecordedSet = useMutation({
    mutationFn: ({ set, id }: { set: SetInput; id: string }) =>
      updateRecordedSet({ ...set, setId: id }),
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
