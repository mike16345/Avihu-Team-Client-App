import { ARTICLE_KEY } from "@/constants/reactQuery";
import { useArticleApi } from "@/hooks/api/useArticleApi";
import queryClient from "@/QueryClient/queryClient";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";

const useUpdateLikeStatus = () => {
  const userId = useUserStore((state) => state.currentUser?._id);
  const { changeLikedStatus } = useArticleApi();

  return useMutation({
    mutationFn: (id: string) => changeLikedStatus(id, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLE_KEY] });
    },
  });
};

export default useUpdateLikeStatus;
