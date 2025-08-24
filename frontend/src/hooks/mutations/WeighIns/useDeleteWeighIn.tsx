import { WEIGH_INS_KEY } from "@/constants/reactQuery";
import { useWeighInApi } from "@/hooks/api/useWeighInApi";
import { useToast } from "@/hooks/useToast";
import queryClient from "@/QueryClient/queryClient";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";

const useDeleteWeighIn = () => {
  const userId = useUserStore((state) => state.currentUser?._id);
  const { deleteWeighIn } = useWeighInApi();

  const { triggerErrorToast, triggerSuccessToast } = useToast();

  const handleDeleteWeighIn = async (id: string) => {
    try {
      const result = await deleteWeighIn(id);

      queryClient.invalidateQueries({ queryKey: [WEIGH_INS_KEY + userId] });
      triggerSuccessToast({ message: result.message });

      return result;
    } catch (error: any) {
      triggerErrorToast({});
      return Promise.reject(error?.message);
    }
  };

  return useMutation({
    mutationFn: handleDeleteWeighIn,
  });
};

export default useDeleteWeighIn;
