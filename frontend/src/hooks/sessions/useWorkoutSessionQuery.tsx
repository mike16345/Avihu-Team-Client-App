import { WORKOUT_SESSION_KEY, ONE_HOUR } from "@/constants/reactQuery";
import { useQuery } from "@tanstack/react-query";
import { useSessionsApi } from "../api/useSessionsApi";

const useWorkoutSessionQuery = (id: string) => {
  const { getSession } = useSessionsApi();

  return useQuery({
    queryKey: [WORKOUT_SESSION_KEY],
    queryFn: () => getSession(id),
    enabled: !!id,
    staleTime: ONE_HOUR * 2,
  });
};

export default useWorkoutSessionQuery;
