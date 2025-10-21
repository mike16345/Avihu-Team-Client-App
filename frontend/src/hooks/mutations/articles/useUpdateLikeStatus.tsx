import { ARTICLE_KEY } from "@/constants/reactQuery";
import { useArticleApi } from "@/hooks/api/useArticleApi";
import queryClient from "@/QueryClient/queryClient";
import { useUserStore } from "@/store/userStore";
import { successNotificationHaptic } from "@/utils/haptics";
import { useMutation } from "@tanstack/react-query";

const useUpdateLikeStatus = (id: string, group: string) => {
  const userId = useUserStore((state) => state.currentUser?._id);
  const { changeLikedStatus } = useArticleApi();

  return useMutation({
    mutationFn: () => changeLikedStatus(id, userId!),
    onSuccess: () => {
      successNotificationHaptic();
      queryClient.invalidateQueries({ queryKey: [ARTICLE_KEY + id] });
      queryClient.invalidateQueries({ queryKey: [ARTICLE_KEY + group] });
    },
  });
};

export default useUpdateLikeStatus;
