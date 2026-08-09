import { useEffect } from "react";
import { AppState } from "react-native";
import { useDietServingsStore } from "@/store/dietServingsStore";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
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
  const { data: plan, isLoading, isError } = useDietPlanQuery();

  useEffect(() => {
    resetIfNewDay();

    const interval = setInterval(resetIfNewDay, RESET_CHECK_INTERVAL_MS);

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") resetIfNewDay();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [resetIfNewDay]);

  useEffect(() => {
    if (isLoading || isError) return;
    if (!planHasAnyTarget(plan)) reset();
  }, [plan, isLoading, isError, reset]);
};
