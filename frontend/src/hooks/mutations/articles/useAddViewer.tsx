import { ARTICLE_COUNT_KEY, ARTICLE_KEY } from "@/constants/reactQuery";
import { useArticleApi } from "@/hooks/api/useArticleApi";
import queryClient from "@/QueryClient/queryClient";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";

const useAddViewer = (articleId: string, group?: string) => {
  const userId = useUserStore((state) => state.currentUser?._id);
  const { addViewer } = useArticleApi();

  return useMutation({
    mutationFn: () => addViewer(articleId, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ARTICLE_KEY + group, ARTICLE_KEY + articleId],
      });
    },
  });
};

export default useAddViewer;
