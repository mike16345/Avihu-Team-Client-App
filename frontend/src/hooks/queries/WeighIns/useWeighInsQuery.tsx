import { ONE_DAY, WEIGH_INS_KEY } from "@/constants/reactQuery";
import { useWeighInApi } from "@/hooks/api/useWeighInApi";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const useWeighInsQuery = () => {
  const id = useUserStore((state) => state.currentUser?._id);
  const { getWeighInsByUserId } = useWeighInApi();

  return useQuery({
    queryFn: () => getWeighInsByUserId(id!),
    queryKey: [WEIGH_INS_KEY + id],
    enabled: !!id,
    staleTime: ONE_DAY * 2,
  });
};

export default useWeighInsQuery;
