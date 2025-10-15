import { WORKOUT_SESSION_KEY } from "@/constants/reactQuery";
import useSession from "./useSession";
import { useCallback } from "react";
import { ISession } from "@/interfaces/ISession";
import useWorkoutSessionQuery from "../queries/useWorkoutSessionQuery";

const useWorkoutSession = () => {
  const {
    session,
    setLocal,
    isLoading: isSessionLoading,
  } = useSession<ISession>(WORKOUT_SESSION_KEY);
  const { isLoading: isServerSessionLoading } = useWorkoutSessionQuery();

  const isLoading = isSessionLoading || isServerSessionLoading;

  const handleSetLocalSession = useCallback(
    async (session: ISession) => {
      await setLocal(session);
    },
    [setLocal]
  );

  return {
    isLoading,
    session,
    handleSetLocalSession,
  };
};

export default useWorkoutSession;
