import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRecordedSetsApi } from "../api/useRecordedSetsApi";
import { IRecordedSet } from "@/interfaces/Workout";
import { RECORDED_SETS_BY_USER_KEY } from "@/constants/reactQuery";
import { useUserStore } from "@/store/userStore";

export const useRecordedSetsMutations = () => {
  const userId = useUserStore((state) => state.currentUser?._id);
  const queryClient = useQueryClient();
  const { addRecordedSet, updateRecordedSet, deleteRecordedSet } = useRecordedSetsApi();

  const useAddRecordedSets = useMutation({
    mutationFn: addRecordedSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECORDED_SETS_BY_USER_KEY + userId] });
    },
  });

  const useUpdateRecordedSet = useMutation({
    mutationFn: ({ id, set }: { id: string; set: IRecordedSet }) => updateRecordedSet(id, set),
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
