import { ARTICLE_KEY } from "@/constants/reactQuery";
import { useArticleApi } from "@/hooks/api/useArticleApi";
import queryClient from "@/QueryClient/queryClient";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";

const useUpdateLikeStatus = (id: string) => {
  const userId = useUserStore((state) => state.currentUser?._id);
  const { changeLikedStatus } = useArticleApi();

  return useMutation({
    mutationFn: () => changeLikedStatus(id, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLE_KEY + id] });
    },
  });
};

export default useUpdateLikeStatus;
