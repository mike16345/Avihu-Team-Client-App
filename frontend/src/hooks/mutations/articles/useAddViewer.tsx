import { ARTICLE_KEY } from "@/constants/reactQuery";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import queryClient from "@/QueryClient/queryClient";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";

const useAddViewer = () => {
  const userId = useUserStore((state) => state.currentUser?._id);
  const { addViewer } = useBlogsApi();

  return useMutation({
    mutationFn: (id: string) => addViewer(id, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLE_KEY] });
    },
  });
};

export default useAddViewer;
