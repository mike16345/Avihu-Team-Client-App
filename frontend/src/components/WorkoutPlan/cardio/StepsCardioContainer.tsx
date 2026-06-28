import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { IStepsCardioType } from "@/interfaces/Workout";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { useShadowStyles } from "@/styles/useShadowStyles";
import { useStepsTracking } from "@/context/StepsTrackingContext";
import {
  DAY_LABELS,
  DEFAULT_DAILY_GOAL,
  DayData,
  HealthStatus,
  MOCK_WEEK,
  MUTED_TEXT_FAINT,
  SMALL_SCREEN_BREAKPOINT,
  SURFACE_WHITE,
  responsiveSizes,
} from "./steps/stepsConstants";
import HealthOnboardingCard from "./steps/HealthOnboardingCard";
import LiveActivityPreview from "./steps/LiveActivityPreview";
import StepsRingHero from "./steps/StepsRingHero";
import WeeklyBalanceRow from "./steps/WeeklyBalanceRow";
import WeeklyStepsChart from "./steps/WeeklyStepsChart";

interface StepsCardioContainerProps {
  plan?: IStepsCardioType;
}

const computeWeeklyBalance = (
  weekData: DayData[],
  goalsByDay: number[],
  todayIndex: number
) => {
  const daysElapsed = todayIndex + 1;
  const actualSoFar = weekData
    .slice(0, daysElapsed)
    .reduce((sum, d) => sum + (d.steps ?? 0), 0);
  const expectedSoFar = goalsByDay
    .slice(0, daysElapsed)
    .reduce((sum, g) => sum + g, 0);
  return actualSoFar - expectedSoFar;
};

const buildGoalsByDay = (plan: IStepsCardioType | undefined): number[] => {
  if (!plan) {
    return Array.from({ length: 7 }, () => DEFAULT_DAILY_GOAL);
  }
  if (plan.mode === "custom" && plan.perDay && plan.perDay.length === 7) {
    return plan.perDay;
  }
  return Array.from({ length: 7 }, () => plan.daily);
};

const formatWeekRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return undefined;
  const formatDate = (value: string) => {
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return `${day}.${month}.${year}`;
  };
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

const nextDemoStatus = (current: HealthStatus): HealthStatus => {
  if (current === "needsPermission") return "denied";
  if (current === "denied") return "granted";
  return "needsPermission";
};

const StepsCardioContainer: React.FC<StepsCardioContainerProps> = ({ plan }) => {
  const { colors, common, layout, spacing } = useStyles();
  const { frameShadow } = useShadowStyles();
  const { width: screenWidth } = useWindowDimensions();
  const { steps, notifications, refreshSteps } = useStepsTracking();

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
  const selectedStepWeek = useNativeData
    ? steps.weeks[selectedWeekIndex] ?? steps.weeks[latestWeekIndex]
    : undefined;
  const isSelectedCurrentWeek = useNativeData ? selectedWeekIndex === latestWeekIndex : true;
  const effectiveStatus: HealthStatus = steps.isNativeAvailable
    ? steps.status
    : canUseDemoData
      ? demoStatus
      : "unavailable";

  const weekData: DayData[] = useMemo(() => {
    if (useNativeData && selectedStepWeek) {
      return selectedStepWeek.days.map((d, i) => ({
        label: DAY_LABELS[i],
        steps: d.steps,
        calories: d.calories,
      }));
    }
    if (effectiveStatus === "granted") {
      return MOCK_WEEK;
    }
    return MOCK_WEEK.map((d) => ({ ...d, steps: 0, calories: 0 }));
  }, [useNativeData, selectedStepWeek, effectiveStatus]);

  const todaySteps = useNativeData ? steps.todaySteps : 0;
  const chartTodayIndex = isSelectedCurrentWeek ? todayIndex : -1;
  const canGoPreviousWeek = useNativeData && selectedWeekIndex > 0;
  const canGoNextWeek = useNativeData && selectedWeekIndex < latestWeekIndex;
  const weekRangeLabel = formatWeekRange(selectedStepWeek?.startDate, selectedStepWeek?.endDate);
  const weeklyBalance = useMemo(
    () => computeWeeklyBalance(weekData, goalsByDay, todayIndex),
    [weekData, goalsByDay, todayIndex]
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
    setSelectedDay(isSelectedCurrentWeek ? todayIndex : 6);
  }, [isSelectedCurrentWeek, selectedWeekIndex, todayIndex]);

  const handleStepsRefresh = useCallback(async () => {
    if (!useNativeData) return;

    setIsRefreshingSteps(true);
    try {
      await refreshSteps();
    } finally {
      setIsRefreshingSteps(false);
    }
  }, [refreshSteps, useNativeData]);

  const isGranted = effectiveStatus === "granted";

  const handleConnectPress = async () => {
    if (steps.isNativeAvailable) {
      if (steps.status === "denied") {
        Linking.openSettings().catch((err) =>
          console.error("[steps] failed to open settings:", err)
        );
        return;
      }
      try {
        await steps.requestPermission();
        if (notifications.isAvailable) {
          await notifications.requestPermission();
        }
      } catch (err) {
        console.error("[steps] handleConnectPress threw:", err);
      }
      return;
    }

    if (!canUseDemoData) {
      console.error(
        "[steps] native health module is unavailable in this installed binary; install a new EAS/dev-client build."
      );
      return;
    }

    setDemoStatus(demoStatus === "needsPermission" ? "denied" : "granted");
  };

  const handleDemoTogglePress = () => {
    setDemoStatus(nextDemoStatus);
  };

  const handlePreviousWeek = useCallback(() => {
    if (!canGoPreviousWeek) return;
    setSelectedWeekIndex((current) => current - 1);
  }, [canGoPreviousWeek]);

  const handleNextWeek = useCallback(() => {
    if (!canGoNextWeek) return;
    setSelectedWeekIndex((current) => current + 1);
  }, [canGoNextWeek]);

  return (
    <ScrollView
      style={[styles.scroll, layout.flex1]}
      contentContainerStyle={[spacing.pdBottomBar]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        isGranted ? (
          <RefreshControl refreshing={isRefreshingSteps} onRefresh={handleStepsRefresh} />
        ) : undefined
      }
    >
      <View
        style={[
          colors.backgroundSurface,
          common.roundedXl,
          spacing.pdMd,
          frameShadow,
          styles.heroCard,
        ]}
      >
        {isGranted ? (
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
        )}

        {isGranted && <WeeklyBalanceRow balance={weeklyBalance} />}
      </View>

      {canUseDemoData && (
        <TouchableOpacity onPress={handleDemoTogglePress} style={styles.demoToggle}>
          <Text fontSize={10} style={styles.demoToggleText}>
            ⚙ דמו: {demoStatus === "granted" ? "מחובר" : demoStatus === "denied" ? "נדחה" : "טרם חיבור"}
          </Text>
        </TouchableOpacity>
      )}

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

      {isGranted && <LiveActivityPreview todaySteps={todaySteps} dailyGoal={dailyGoal} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: SURFACE_WHITE,
  },
  heroCard: {
    marginBottom: 20,
  },
  demoToggle: {
    alignSelf: "flex-start",
    marginBottom: 8,
    marginTop: -10,
  },
  demoToggleText: {
    color: MUTED_TEXT_FAINT,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});

export default StepsCardioContainer;
