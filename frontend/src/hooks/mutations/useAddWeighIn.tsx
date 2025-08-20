import { useMutation } from "@tanstack/react-query";
import { useWeighInApi } from "../api/useWeighInApi";
import { useUserStore } from "@/store/userStore";
import { useToast } from "../useToast";
import { IWeighInPost } from "@/interfaces/User";
import queryClient from "@/QueryClient/queryClient";
import { WEIGH_INS_KEY } from "@/constants/reactQuery";

const useAddWeighIn = () => {
  const id = useUserStore((state) => state.currentUser?._id);
  const { addWeighIn } = useWeighInApi();
  const { triggerErrorToast, triggerSuccessToast } = useToast();

  return useMutation({
    mutationFn: (weighIn: IWeighInPost) => {
      if (!id) {
        triggerErrorToast({ title: "שגיאה", message: "אין משתמש" });
        return Promise.reject();
      }

      return addWeighIn(id, weighIn);
    },
    onSuccess: () => {
      triggerSuccessToast({ title: "הועלה בהצלחה ", message: "ניתן להיות במעקב דרך גרף השקילות" });
      queryClient.invalidateQueries({ queryKey: [WEIGH_INS_KEY + id] });
    },
  });
};

export default useAddWeighIn;
