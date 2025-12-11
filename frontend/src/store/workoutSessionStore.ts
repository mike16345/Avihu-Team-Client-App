import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ISession } from "@/interfaces/ISession";
import { ONE_HOUR } from "@/constants/reactQuery";

export function getNextSetNumberFromSession(
  session: ISession | null,
  plan: string,
  exerciseName: string
) {
  if (!session) return 1;
  const planData = session.data?.[plan];
  const exerciseData = planData?.[exerciseName];

  return (exerciseData?.setNumber as number) || 1;
}
const SESSION_TTL_MS = ONE_HOUR * 6; // 6 hours

export interface IWorkoutSessionStore {
  workoutSession: ISession | null;
  getNextSetNumber: (plan: string, exercise: string, serverSession?: ISession) => number;
  setWorkoutSession: (data: ISession) => void;
  clearWorkoutSession: () => void;
}

export const useWorkoutSessionStore = create<IWorkoutSessionStore>()(
  persist(
    (set, get) => ({
      workoutSession: null,

      setWorkoutSession: (session) => {
        set({ workoutSession: session });
      },
      getNextSetNumber: (plan, exercise, serverSession) => {
        const currentSession = serverSession ?? get().workoutSession;
        if (!currentSession) return 1;

        return getNextSetNumberFromSession(currentSession, plan, exercise);
      },
      clearWorkoutSession: () => {
        set({ workoutSession: null });
      },
    }),
    {
      name: "workout-session-store",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        const session = state?.workoutSession as any;
        if (!session?.updatedAt || !state) return;

        const lastUpdateMs = new Date(session.updatedAt).getTime();
        if (Number.isNaN(lastUpdateMs)) return;

        const ageMs = Date.now() - lastUpdateMs;
        if (ageMs > SESSION_TTL_MS) {
          state.clearWorkoutSession();
        }
      },
      partialize: (state) => ({ workoutSession: state.workoutSession }),
    }
  )
);
