import { useQuery } from "@tanstack/react-query";
import { useSessionsApi } from "../api/useSessionsApi";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { ONE_HOUR, WORKOUT_SESSION_KEY } from "@/constants/reactQuery";

const useWorkoutSessionQuery = () => {
  const { getSession } = useSessionsApi();
  const { getItem, removeItem } = useAsyncStorage(WORKOUT_SESSION_KEY);

  const loadWorkoutSession = async () => {
    const session = await getItem();
    if (!session) return;

    try {
      const sessionJSON = JSON.parse(session);
      const sessionId = sessionJSON?._id || "";
      const currentWorkoutSession = await getSession(sessionId);

      if (!currentWorkoutSession) removeItem();

      return currentWorkoutSession;
    } catch (e) {
      removeItem();
      return null;
    }
  };

  return useQuery({
    queryKey: [WORKOUT_SESSION_KEY],
    queryFn: loadWorkoutSession,
    enabled: true,
    staleTime: ONE_HOUR,
  });
};

export default useWorkoutSessionQuery;
