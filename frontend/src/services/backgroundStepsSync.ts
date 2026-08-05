import { readTodayStepsForBackgroundSync } from "@/hooks/api/useStepsData";
import { notifyStepsMilestone } from "@/hooks/api/useStepsNotifications";
import { syncStepsProgress } from "@/hooks/api/useStepsProgressApi";
import { getWorkoutPlanByUserId } from "@/hooks/api/useWorkoutPlanApi";
import { loadPersistedAuthSession } from "@/services/authSession";
import {
  buildGoalsByDay,
  getLocalDateKey,
  STEPS_MILESTONE_PLAN_TYPE,
  stepsToDistanceKm,
} from "@/utils/stepsUtils";

export type BackgroundStepsSyncResult = "synced" | "skipped";

export const syncTodayStepsInBackground = async (
  now: Date = new Date(),
): Promise<BackgroundStepsSyncResult> => {
  const session = await loadPersistedAuthSession();
  const user = session?.user;
  if (!user?._id) return "skipped";

  const workoutPlan = await getWorkoutPlanByUserId(user._id);
  if (workoutPlan?.cardio?.type !== "steps") return "skipped";

  const stepsPlan = workoutPlan.cardio.plan;
  if (!("mode" in stepsPlan)) return "skipped";

  const dailyGoal = buildGoalsByDay(stepsPlan)[now.getDay()];
  if (!Number.isFinite(dailyGoal) || dailyGoal <= 0) return "skipped";

  const steps = await readTodayStepsForBackgroundSync(now);
  if (!steps) return "skipped";

  if (user.planType === STEPS_MILESTONE_PLAN_TYPE) {
    await notifyStepsMilestone(steps.steps, dailyGoal, user._id);
  }

  await syncStepsProgress({
    date: getLocalDateKey(now),
    steps: steps.steps,
    calories: steps.calories,
    distanceKm: stepsToDistanceKm(steps.steps, 2),
    dailyGoal,
    source: steps.source,
  });

  return "synced";
};
