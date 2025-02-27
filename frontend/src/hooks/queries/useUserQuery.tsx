import { useUserApi } from "../api/useUserApi";
import { useQuery } from "@tanstack/react-query";
import { ONE_HOUR } from "@/constants/reactQuery";

const useUserQuery = (id?: string) => {
  const { getUserById } = useUserApi();

  return useQuery({
    queryKey: ["user-", id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
    staleTime: ONE_HOUR / 2,
  });
};

export default useUserQuery;
