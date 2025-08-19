import { ONE_DAY, WEIGH_INS_KEY } from "@/constants/reactQuery";
import { useWeighInApi } from "@/hooks/api/useWeighInApi";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const useWeighInsQuery = () => {
  const { currentUser } = useUserStore();
  const { getWeighInsByUserId } = useWeighInApi();

  return useQuery({
    queryFn: () => getWeighInsByUserId(currentUser!._id),
    queryKey: [WEIGH_INS_KEY + currentUser?._id],
    enabled: !!currentUser,
    staleTime: ONE_DAY * 2,
  });
};

export default useWeighInsQuery;
