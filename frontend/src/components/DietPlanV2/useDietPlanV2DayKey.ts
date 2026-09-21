import { useEffect, useState } from "react";
import { AppState } from "react-native";
import {
  getDietPlanV2DayKey,
  getMillisecondsUntilDietPlanV2DayChange,
} from "./dietPlanV2Consumption";

const useDietPlanV2DayKey = (): string => {
  const [dayKey, setDayKey] = useState(getDietPlanV2DayKey);

  useEffect(() => {
    let rolloverTimer: ReturnType<typeof setTimeout>;

    const refresh = () => setDayKey(getDietPlanV2DayKey());
    const scheduleRollover = () => {
      rolloverTimer = setTimeout(() => {
        refresh();
        scheduleRollover();
      }, getMillisecondsUntilDietPlanV2DayChange() + 50);
    };

    scheduleRollover();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    return () => {
      clearTimeout(rolloverTimer);
      subscription.remove();
    };
  }, []);

  return dayKey;
};

export default useDietPlanV2DayKey;
