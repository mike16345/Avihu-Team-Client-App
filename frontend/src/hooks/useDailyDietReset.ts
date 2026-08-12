import { useEffect } from "react";
import { AppState } from "react-native";
import { useDietServingsStore } from "@/store/dietServingsStore";
import useDietPlanV1Query from "@/hooks/queries/useDietPlanV1Query";
import { IDietPlan, IMeal } from "@/interfaces/DietPlan";

const RESET_CHECK_INTERVAL_MS = 60 * 1000;

const sumMealField = (
  meals: IMeal[],
  field: "totalProtein" | "totalCarbs" | "totalFats" | "totalVeggies"
): number => meals.reduce((acc, m) => acc + (m[field]?.quantity ?? 0), 0);

const planHasAnyTarget = (plan: IDietPlan | undefined): boolean => {
  if (!plan) return true;
  const meals = plan.meals ?? [];
  return (
    (plan.totalCalories ?? 0) > 0 ||
    (plan.freeCalories ?? 0) > 0 ||
    (plan.veggiesPerDay ?? 0) > 0 ||
    sumMealField(meals, "totalProtein") > 0 ||
    sumMealField(meals, "totalCarbs") > 0 ||
    sumMealField(meals, "totalFats") > 0 ||
    sumMealField(meals, "totalVeggies") > 0
  );
};

export const useDailyDietReset = () => {
  const resetIfNewDay = useDietServingsStore((s) => s.resetIfNewDay);
  const reset = useDietServingsStore((s) => s.reset);
  const reconcileEaten = useDietServingsStore((s) => s.reconcileEaten);
  const reconcileWithTargets = useDietServingsStore((s) => s.reconcileWithTargets);
  const { data: plan, isLoading, isError } = useDietPlanV1Query();

  useEffect(() => {
    resetIfNewDay();
    reconcileEaten();

    const interval = setInterval(() => {
      resetIfNewDay();
      reconcileEaten();
    }, RESET_CHECK_INTERVAL_MS);

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        resetIfNewDay();
        reconcileEaten();
      }
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [resetIfNewDay, reconcileEaten]);

  useEffect(() => {
    if (isLoading || isError) return;
    if (!planHasAnyTarget(plan)) {
      reset();
      return;
    }
    const meals = plan?.meals ?? [];
    reconcileWithTargets({
      protein: sumMealField(meals, "totalProtein"),
      carbs: sumMealField(meals, "totalCarbs"),
      fat: sumMealField(meals, "totalFats"),
      veg: plan?.veggiesPerDay ?? sumMealField(meals, "totalVeggies"),
      free: plan?.freeCalories ?? 0,
    });
  }, [plan, isLoading, isError, reset, reconcileWithTargets]);
};
