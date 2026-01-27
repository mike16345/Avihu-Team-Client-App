import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useWorkoutSessionStore } from "@/store/workoutSessionStore";
import { ONE_HOUR } from "@/constants/reactQuery";

const SESSION_TTL_MS = ONE_HOUR * 6;

export function useWorkoutSessionExpiryWatcher() {
  const workoutSession = useWorkoutSessionStore((state) => state.workoutSession);
  const clearWorkoutSession = useWorkoutSessionStore((state) => state.clearWorkoutSession);

  useEffect(() => {
    const checkExpiry = () => {
      if (!workoutSession?.updatedAt) return;

      const lastUpdateMs = new Date(workoutSession.updatedAt as any).getTime();
      if (Number.isNaN(lastUpdateMs)) return;

      const ageMs = Date.now() - lastUpdateMs;
      if (ageMs > SESSION_TTL_MS) {
        clearWorkoutSession();
      }
    };

    checkExpiry();

    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        checkExpiry();
      }
    });

    return () => {
      sub.remove();
    };
  }, [workoutSession?.updatedAt, clearWorkoutSession]);
}
