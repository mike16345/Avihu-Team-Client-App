import { USER_IMAGE_URLS_KEY } from "@/constants/reactQuery";
import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const FIVE_MINUTES = 5 * 60 * 1000;

const useUserImageUrlsQuery = () => {
  const id = useUserStore((state) => state.currentUser?._id);
  const { getUserImageUrls } = useWeighInPhotosApi();

  return useQuery({
    queryFn: () => getUserImageUrls(id!),
    queryKey: [USER_IMAGE_URLS_KEY + id],
    enabled: !!id,
    staleTime: FIVE_MINUTES,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
};

export default useUserImageUrlsQuery;
