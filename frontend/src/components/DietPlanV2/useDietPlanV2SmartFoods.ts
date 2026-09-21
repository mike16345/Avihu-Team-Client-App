import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import { replaceSmartFoodEntry, sumSmartFoodMacros, type SmartFoodEntry } from "./foodCatalog";
import { getDietPlanV2SmartFoodsStorageKey, reconcileSmartFoodEntries } from "./smartFoodStorage";
import useDietPlanV2DayKey from "./useDietPlanV2DayKey";

const useDietPlanV2SmartFoods = (plan: IDietPlanV2) => {
  const dayKey = useDietPlanV2DayKey();
  const storageKey = useMemo(() => getDietPlanV2SmartFoodsStorageKey(plan, dayKey), [dayKey, plan]);
  const [entries, setEntries] = useState<SmartFoodEntry[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    setIsReady(false);

    void AsyncStorage.getItem(storageKey)
      .then((stored) => {
        if (!active) return;
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        setEntries(reconcileSmartFoodEntries(parsed));
      })
      .catch(() => {
        if (active) setEntries([]);
      })
      .finally(() => {
        if (active) setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, [storageKey]);

  const updateEntries = useCallback(
    (update: (current: SmartFoodEntry[]) => SmartFoodEntry[]) => {
      if (!isReady) return;

      setEntries((current) => {
        const next = update(current);
        void AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => undefined);
        return next;
      });
    },
    [isReady, storageKey]
  );

  const recordFood = useCallback(
    (entry: SmartFoodEntry) => updateEntries((current) => [...current, entry]),
    [updateEntries]
  );

  const removeFood = useCallback(
    (entryId: string) => updateEntries((current) => current.filter(({ id }) => id !== entryId)),
    [updateEntries]
  );

  const updateFood = useCallback(
    (entry: SmartFoodEntry) => updateEntries((current) => replaceSmartFoodEntry(current, entry)),
    [updateEntries]
  );

  return {
    entries,
    totals: sumSmartFoodMacros(entries),
    isReady,
    recordFood,
    updateFood,
    removeFood,
  };
};

export default useDietPlanV2SmartFoods;
