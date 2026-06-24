import React, { useEffect, useMemo, useState } from "react";
import {
  Linking,
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
import useStepsData from "@/hooks/api/useStepsData";
import useStepsNotifications from "@/hooks/api/useStepsNotifications";
import useLiveStepsActivity from "@/hooks/api/useLiveStepsActivity";
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

const nextDemoStatus = (current: HealthStatus): HealthStatus => {
  if (current === "needsPermission") return "denied";
  if (current === "denied") return "granted";
  return "needsPermission";
};

const StepsCardioContainer: React.FC<StepsCardioContainerProps> = ({ plan }) => {
  const { colors, common, layout, spacing } = useStyles();
  const { frameShadow } = useShadowStyles();
  const { width: screenWidth } = useWindowDimensions();
  const steps = useStepsData();
  const notifications = useStepsNotifications();
  const liveActivity = useLiveStepsActivity();

  const [demoStatus, setDemoStatus] = useState<HealthStatus>("needsPermission");
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  const todayIndex = new Date().getDay();
  const goalsByDay = useMemo(() => buildGoalsByDay(plan), [plan]);
  const dailyGoal = goalsByDay[todayIndex];

  const isSmall = screenWidth < SMALL_SCREEN_BREAKPOINT;
  const sizes = useMemo(() => responsiveSizes(isSmall), [isSmall]);

  const useNativeData = steps.isNativeAvailable && steps.status === "granted";
  const effectiveStatus: HealthStatus = steps.isNativeAvailable ? steps.status : demoStatus;

  const weekData: DayData[] = useMemo(() => {
    if (useNativeData) {
      return steps.week.map((d, i) => ({
        label: DAY_LABELS[i],
        steps: d.steps,
        calories: d.calories,
      }));
    }
    if (effectiveStatus === "granted") {
      return MOCK_WEEK;
    }
    return MOCK_WEEK.map((d) => ({ ...d, steps: 0, calories: 0 }));
  }, [useNativeData, steps.week, effectiveStatus]);

  const todaySteps = useNativeData ? steps.todaySteps : 8500;
  const weeklyBalance = useMemo(
    () => computeWeeklyBalance(weekData, goalsByDay, todayIndex),
    [weekData, goalsByDay, todayIndex]
  );

  useEffect(() => {
    if (!useNativeData) return;
    notifications.scheduleDaily(todaySteps, dailyGoal);
  }, [useNativeData, todaySteps, dailyGoal, notifications]);

  useEffect(() => {
    if (!useNativeData || !liveActivity.isAvailable) return;
    if (liveActivity.activityId) {
      liveActivity.update(todaySteps, dailyGoal);
    } else {
      liveActivity.start(todaySteps, dailyGoal);
    }
  }, [useNativeData, todaySteps, dailyGoal, liveActivity]);

  const isGranted = effectiveStatus === "granted";

  const handleConnectPress = async () => {
    console.log("[steps] handleConnectPress", {
      isNativeAvailable: steps.isNativeAvailable,
      currentStatus: steps.status,
    });
    if (steps.isNativeAvailable) {
      if (steps.status === "denied") {
        Linking.openURL("app-settings:").catch((err) =>
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
    setDemoStatus(demoStatus === "needsPermission" ? "denied" : "granted");
  };

  const handleDemoTogglePress = () => {
    setDemoStatus(nextDemoStatus);
  };

  return (
    <ScrollView
      style={[styles.scroll, layout.flex1]}
      contentContainerStyle={[spacing.pdBottomBar]}
      showsVerticalScrollIndicator={false}
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

      {__DEV__ && !steps.isNativeAvailable && (
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
        weeklyBalance={weeklyBalance}
        todayIndex={todayIndex}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        detailValueFont={sizes.detailValueFont}
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
