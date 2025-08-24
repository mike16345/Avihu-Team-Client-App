import { useWeighInApi } from "@/hooks/api/useWeighInApi";
import { IWeighInPost } from "@/interfaces/User";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import queryClient from "@/QueryClient/queryClient";
import { WEIGH_INS_KEY } from "@/constants/reactQuery";
import { useUserStore } from "@/store/userStore";

const useUpdateWeighIn = () => {
  const userId = useUserStore((state) => state.currentUser?._id);

  const { updateWeighInById } = useWeighInApi();
  const { triggerErrorToast, triggerSuccessToast } = useToast();

  const handleUpdateWeighIn = async ({ id, data }: { id: string; data: IWeighInPost }) => {
    try {
      const result = await updateWeighInById(id, data);

      queryClient.invalidateQueries({ queryKey: [WEIGH_INS_KEY + userId] });
      triggerSuccessToast({ message: result.message });

      return result;
    } catch (error: any) {
      triggerErrorToast({});
      return Promise.reject(error?.message);
    }
  };

  return useMutation({
    mutationFn: handleUpdateWeighIn,
  });
};

export default useUpdateWeighIn;
