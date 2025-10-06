import { useQuery } from "@tanstack/react-query";
import { useSessionsApi } from "../api/useSessionsApi";
import { ONE_HOUR, WORKOUT_SESSION_KEY } from "@/constants/reactQuery";
import { ISession } from "@/interfaces/ISession";
import useSession from "../sessions/useSession";

const useWorkoutSessionQuery = () => {
  const { getSession } = useSessionsApi();
  const { session, setLocal, removeLocal } = useSession<ISession>(WORKOUT_SESSION_KEY);

  const loadWorkoutSession = async () => {
    if (!session) return null;

    try {
      const currentWorkoutSession = await getSession(session._id);

      if (currentWorkoutSession) {
        setLocal(currentWorkoutSession.data);
      }

      return currentWorkoutSession;
    } catch (e: any) {
      if (e?.response?.status == 404) removeLocal();
      return {};
    }
  };

  return useQuery({
    queryKey: [WORKOUT_SESSION_KEY],
    queryFn: loadWorkoutSession,
    enabled: !!session,
    staleTime: ONE_HOUR * 1.5,
  });
};

export default useWorkoutSessionQuery;
