import { useQuery } from "@tanstack/react-query";
import { useSessionsApi } from "../api/useSessionsApi";
import { ONE_HOUR, WORKOUT_SESSION_KEY } from "@/constants/reactQuery";
import { ISession } from "@/interfaces/ISession";
import { useWorkoutSessionStore } from "@/store/workoutSessionStore";

const useWorkoutSessionQuery = () => {
  const { getSession } = useSessionsApi();

  const { workoutSession, setWorkoutSession, clearWorkoutSession } = useWorkoutSessionStore();

  const loadWorkoutSession = async () => {
    if (!workoutSession?._id) return null;
    const currentWorkoutSession = await getSession(workoutSession._id).catch(() => null);

    if (!currentWorkoutSession) {
      clearWorkoutSession();
      return null;
    }

    const data = currentWorkoutSession.data as ISession;
    setWorkoutSession(data);

    return currentWorkoutSession;
  };

  return useQuery({
    queryKey: [WORKOUT_SESSION_KEY, workoutSession?._id],
    queryFn: loadWorkoutSession,
    enabled: !!workoutSession?._id,
    staleTime: ONE_HOUR * 1.5,
  });
};

export default useWorkoutSessionQuery;
