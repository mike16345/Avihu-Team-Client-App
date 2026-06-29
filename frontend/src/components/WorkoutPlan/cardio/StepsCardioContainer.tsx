import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useStepsTracking } from "@/context/StepsTrackingContext";
import { IStepsCardioType } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";
import { buildGoalsByDay, formatWeekRange } from "@/utils/stepsUtils";
import HealthOnboardingCard from "./steps/HealthOnboardingCard";
import LiveActivityPreview from "./steps/LiveActivityPreview";
import StepsRingHero from "./steps/StepsRingHero";
import {
  DAY_LABELS,
  DayData,
  HealthStatus,
  MOCK_WEEK,
  SMALL_SCREEN_BREAKPOINT,
  responsiveSizes,
} from "./steps/stepsConstants";
import WeeklyBalanceRow from "./steps/WeeklyBalanceRow";
import WeeklyStepsChart from "./steps/WeeklyStepsChart";

interface StepsCardioContainerProps {
  plan?: IStepsCardioType;
}

const computeWeeklyBalance = (weekData: DayData[], goalsByDay: number[], todayIndex: number) => {
  const daysElapsed = todayIndex + 1;
  const actualSoFar = weekData
    .slice(0, daysElapsed)
    .reduce((sum, day) => sum + (day.steps ?? 0), 0);
  const expectedSoFar = goalsByDay.slice(0, daysElapsed).reduce((sum, goal) => sum + goal, 0);

  return actualSoFar - expectedSoFar;
};

const getEffectiveStatus = (
  isNativeAvailable: boolean,
  status: HealthStatus,
  canUseDemoData: boolean,
  demoStatus: HealthStatus
): HealthStatus => {
  if (isNativeAvailable) {
    return status;
  }

  if (canUseDemoData) {
    return demoStatus;
  }

  return "unavailable";
};

const getSelectedWeek = (
  useNativeData: boolean,
  weeks: Array<{
    startDate: string;
    endDate: string;
    days: Array<{ steps: number; calories: number }>;
  }>,
  selectedWeekIndex: number,
  latestWeekIndex: number
) => {
  if (!useNativeData) {
    return undefined;
  }

  return weeks[selectedWeekIndex] ?? weeks[latestWeekIndex];
};

const buildWeekData = (
  useNativeData: boolean,
  effectiveStatus: HealthStatus,
  selectedWeek:
    | {
        startDate: string;
        endDate: string;
        days: Array<{ steps: number; calories: number }>;
      }
    | undefined
): DayData[] => {
  if (useNativeData && selectedWeek) {
    return selectedWeek.days.map((day, index) => ({
      label: DAY_LABELS[index],
      steps: day.steps,
      calories: day.calories,
    }));
  }

  if (effectiveStatus === "granted") {
    return MOCK_WEEK;
  }

  return MOCK_WEEK.map((day) => ({ ...day, steps: 0, calories: 0 }));
};

const StepsCardioContainer: React.FC<StepsCardioContainerProps> = ({ plan }) => {
  const { colors, common, layout, spacing } = useStyles();
  const { width: screenWidth } = useWindowDimensions();
  const { notifications, refreshSteps, steps } = useStepsTracking();

  const [demoStatus, setDemoStatus] = useState<HealthStatus>("needsPermission");
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [isRefreshingSteps, setIsRefreshingSteps] = useState(false);
  const hasSelectedInitialWeekRef = useRef(false);

  const todayIndex = new Date().getDay();
  const goalsByDay = useMemo(() => buildGoalsByDay(plan), [plan]);
  const dailyGoal = goalsByDay[todayIndex];
  const isSmall = screenWidth < SMALL_SCREEN_BREAKPOINT;
  const sizes = useMemo(() => responsiveSizes(isSmall), [isSmall]);
  const canUseDemoData = __DEV__ && !steps.isNativeAvailable;
  const useNativeData = steps.isNativeAvailable && steps.status === "granted";
  const latestWeekIndex = Math.max(0, steps.weeks.length - 1);
  const effectiveStatus = getEffectiveStatus(
    steps.isNativeAvailable,
    steps.status,
    canUseDemoData,
    demoStatus
  );
  const selectedWeek = getSelectedWeek(
    useNativeData,
    steps.weeks,
    selectedWeekIndex,
    latestWeekIndex
  );
  const isSelectedCurrentWeek = !useNativeData || selectedWeekIndex === latestWeekIndex;
  const weekData = useMemo(
    () => buildWeekData(useNativeData, effectiveStatus, selectedWeek),
    [effectiveStatus, selectedWeek, useNativeData]
  );

  const isGranted = effectiveStatus === "granted";
  const todaySteps = useNativeData ? steps.todaySteps : 0;
  const chartTodayIndex = isSelectedCurrentWeek ? todayIndex : -1;
  const canGoPreviousWeek = useNativeData && selectedWeekIndex > 0;
  const canGoNextWeek = useNativeData && selectedWeekIndex < latestWeekIndex;
  const weekRangeLabel = formatWeekRange(selectedWeek?.startDate, selectedWeek?.endDate);
  const weeklyBalance = useMemo(
    () => computeWeeklyBalance(weekData, goalsByDay, todayIndex),
    [goalsByDay, todayIndex, weekData]
  );

  useEffect(() => {
    if (!useNativeData || steps.weeks.length === 0) {
      hasSelectedInitialWeekRef.current = false;
      return;
    }

    if (!hasSelectedInitialWeekRef.current) {
      setSelectedWeekIndex(latestWeekIndex);
      hasSelectedInitialWeekRef.current = true;
      return;
    }

    setSelectedWeekIndex((current) => Math.min(current, latestWeekIndex));
  }, [latestWeekIndex, steps.weeks.length, useNativeData]);

  useEffect(() => {
    if (isSelectedCurrentWeek) {
      setSelectedDay(todayIndex);
      return;
    }

    setSelectedDay(6);
  }, [isSelectedCurrentWeek, todayIndex]);

  const handleStepsRefresh = useCallback(async () => {
    if (!useNativeData) {
      return;
    }

    setIsRefreshingSteps(true);
    try {
      await refreshSteps();
    } finally {
      setIsRefreshingSteps(false);
    }
  }, [refreshSteps, useNativeData]);

  const handleConnectPress = async () => {
    if (!steps.isNativeAvailable) {
      if (!canUseDemoData) {
        console.error(
          "[steps] native health module is unavailable in this installed binary; install a new EAS/dev-client build."
        );
        return;
      }

      setDemoStatus((current) => (current === "needsPermission" ? "denied" : "granted"));
      return;
    }

    if (steps.status === "denied" && Platform.OS === "ios") {
      Linking.openSettings().catch((err) => console.error("[steps] failed to open settings:", err));
      return;
    }

    try {
      const granted = await steps.requestPermission();
      if (granted && notifications.isAvailable) {
        await notifications.requestPermission();
      }
    } catch (err) {
      console.error("[steps] handleConnectPress threw:", err);
    }
  };

  const handlePreviousWeek = useCallback(() => {
    if (!canGoPreviousWeek) {
      return;
    }

    setSelectedWeekIndex((current) => current - 1);
  }, [canGoPreviousWeek]);

  const handleNextWeek = useCallback(() => {
    if (!canGoNextWeek) {
      return;
    }

    setSelectedWeekIndex((current) => current + 1);
  }, [canGoNextWeek]);

  const heroContent = isGranted ? (
    <StepsRingHero
      todaySteps={todaySteps}
      dailyGoal={dailyGoal}
      ringSize={sizes.ringSize}
      ringValueFont={sizes.ringValueFont}
      titleFont={sizes.titleFont}
      ringTextGap={sizes.ringTextGap}
    />
  ) : (
    <HealthOnboardingCard
      status={effectiveStatus}
      titleFont={sizes.titleFont}
      onPressConnect={handleConnectPress}
    />
  );

  const refreshControl = isGranted ? (
    <RefreshControl refreshing={isRefreshingSteps} onRefresh={handleStepsRefresh} />
  ) : undefined;

  return (
    <ScrollView
      style={layout.flex1}
      contentContainerStyle={[spacing.pdBottomBar, spacing.gap20]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      <View style={[colors.backgroundSurface, common.roundedXl, spacing.pdMd]}>
        {heroContent}
        {isGranted ? <WeeklyBalanceRow balance={weeklyBalance} /> : null}
      </View>

      <View style={[styles.sectionTitleRow, layout.itemsCenter]}>
        <Text fontVariant="bold" fontSize={17} style={colors.textPrimary}>
          מעקב צעדים שבועי
        </Text>
      </View>

      <WeeklyStepsChart
        weekData={weekData}
        dailyGoal={dailyGoal}
        goalsByDay={goalsByDay}
        todayIndex={chartTodayIndex}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        detailValueFont={sizes.detailValueFont}
        weekRangeLabel={weekRangeLabel}
        canGoPreviousWeek={canGoPreviousWeek}
        canGoNextWeek={canGoNextWeek}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
      />

      {isGranted ? <LiveActivityPreview todaySteps={todaySteps} dailyGoal={dailyGoal} /> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});

export default StepsCardioContainer;
