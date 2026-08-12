import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import {
  computeDietPlanV2ConsumedTotals,
  getDietPlanV2ConsumptionStorageKey,
  getDietPlanV2MealKey,
  getDietPlanV2TrackableRows,
  reconcileDietPlanV2Completion,
  toggleDietPlanV2Meal,
  toggleDietPlanV2Row,
  type DietPlanV2CompletionMap,
} from "./dietPlanV2Consumption";

const readCompletion = async (storageKey: string): Promise<unknown> => {
  try {
    const stored = await AsyncStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const useDietPlanV2Consumption = (plan: IDietPlanV2) => {
  const storageKey = useMemo(() => getDietPlanV2ConsumptionStorageKey(plan), [plan]);
  const [completion, setCompletion] = useState<DietPlanV2CompletionMap>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    setIsReady(false);

    void readCompletion(storageKey).then((stored) => {
      if (!active) return;
      setCompletion(reconcileDietPlanV2Completion(plan, stored));
      setIsReady(true);
    });

    return () => {
      active = false;
    };
  }, [plan, storageKey]);

  const updateCompletion = useCallback(
    (update: (current: DietPlanV2CompletionMap) => DietPlanV2CompletionMap) => {
      if (!isReady) return;

      setCompletion((current) => {
        const next = update(current);
        void AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => undefined);
        return next;
      });
    },
    [isReady, storageKey]
  );

  const toggleRow = useCallback(
    (mealIndex: number, rowKey: string) => {
      const meal = plan.meals[mealIndex];
      if (!meal) return;
      const mealKey = getDietPlanV2MealKey(meal, mealIndex);
      const rows = getDietPlanV2TrackableRows(meal);
      updateCompletion((current) => toggleDietPlanV2Row(current, mealKey, rowKey, rows));
    },
    [plan.meals, updateCompletion]
  );

  const toggleMeal = useCallback(
    (mealIndex: number) => {
      const meal = plan.meals[mealIndex];
      if (!meal) return;
      const mealKey = getDietPlanV2MealKey(meal, mealIndex);
      const rows = getDietPlanV2TrackableRows(meal);
      updateCompletion((current) => toggleDietPlanV2Meal(current, mealKey, rows));
    },
    [plan.meals, updateCompletion]
  );

  return {
    completion,
    consumedTotals: computeDietPlanV2ConsumedTotals(plan, completion),
    isReady,
    toggleRow,
    toggleMeal,
  };
};

export default useDietPlanV2Consumption;
