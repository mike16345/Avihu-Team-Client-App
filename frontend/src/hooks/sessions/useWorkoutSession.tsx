import { WORKOUT_SESSION_KEY } from "@/constants/reactQuery";
import useSession from "./useSession";
import { useCallback, useEffect } from "react";
import { ISession } from "@/interfaces/ISession";
import useWorkoutSessionQuery from "../queries/useWorkoutSessionQuery";

const useWorkoutSession = () => {
  const { data: serverSession, isLoading: isServerSessionLoading } = useWorkoutSessionQuery();
  const {
    session,
    setLocal,
    isLoading: isSessionLoading,
  } = useSession<ISession>(WORKOUT_SESSION_KEY);

  const isLoading = isSessionLoading || isServerSessionLoading;

  const handleSetLocalSession = useCallback(
    async (session: ISession) => {
      await setLocal(session);
    },
    [setLocal]
  );

  useEffect(() => {
    if (!serverSession) return;
    const loadSession = async () => {
      await setLocal(serverSession.data);
    };

    loadSession().catch(() => {});
  }, [serverSession]);

  return {
    isLoading,
    session,
    handleSetLocalSession,
  };
};

export default useWorkoutSession;
