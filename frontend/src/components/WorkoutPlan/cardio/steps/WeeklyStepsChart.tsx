import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Easing, cancelAnimation, useSharedValue, withTiming } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import {
  DAY_LABEL_TEXT,
  DayData,
  LIGHT_TEXT_ON_DARK,
  MUTED_TEXT_FAINT,
  PRIMARY_DARK,
  SELECTED_PILL_BG,
} from "./stepsConstants";
import DayDetailPanel from "./DayDetailPanel";
import WeeklyStepsBarChart from "./WeeklyStepsBarChart";
import WeeklyStepsChartHeader from "./WeeklyStepsChartHeader";

interface WeeklyStepsChartProps {
  weekData: DayData[];
  dailyGoal: number;
  goalsByDay?: number[];
  todayIndex: number;
  selectedDay: number;
  onSelectDay: (index: number) => void;
  detailValueFont: number;
  weekRangeLabel?: string;
  canGoPreviousWeek?: boolean;
  canGoNextWeek?: boolean;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
}

const getDayLabelPillStyle = (isToday: boolean, isSelected: boolean) => {
  if (isToday) {
    return styles.todayPill;
  }

  if (isSelected) {
    return styles.selectedPill;
  }

  return styles.plainPill;
};

const getDayLabelTextColor = (isToday: boolean) => {
  if (isToday) {
    return LIGHT_TEXT_ON_DARK;
  }

  return DAY_LABEL_TEXT;
};

const getWeeklyGoalTotal = (weekLength: number, dailyGoal: number, goalsByDay?: number[]) =>
  (goalsByDay ?? Array(weekLength).fill(dailyGoal)).reduce((sum, goal) => sum + goal, 0);

const WeeklyStepsChart: React.FC<WeeklyStepsChartProps> = ({
  weekData,
  dailyGoal,
  goalsByDay,
  todayIndex,
  selectedDay,
  onSelectDay,
  detailValueFont,
  weekRangeLabel,
  canGoPreviousWeek = false,
  canGoNextWeek = false,
  onPreviousWeek,
  onNextWeek,
}) => {
  const { colors, common, spacing } = useStyles();
  const barProgress = useSharedValue(0);

  const weeklyGoalTotal = getWeeklyGoalTotal(weekData.length, dailyGoal, goalsByDay);
  const totalSteps = weekData.reduce((sum, day) => sum + (day.steps ?? 0), 0);
  const selectedDetail = weekData[selectedDay];
  const detailContent = selectedDetail ? (
    <DayDetailPanel detail={selectedDetail} detailValueFont={detailValueFont} />
  ) : (
    <Text fontSize={11} style={styles.tapHint}>
      לחץ על יום לפרטים
    </Text>
  );

  useFocusEffect(
    useCallback(() => {
      barProgress.value = 0;
      barProgress.value = withTiming(1, {
        duration: 1700,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });

      return () => {
        cancelAnimation(barProgress);
      };
    }, [barProgress, totalSteps])
  );

  return (
    <View style={[colors.backgroundSurface, common.roundedXl, spacing.pdMd]}>
      <WeeklyStepsChartHeader
        totalSteps={totalSteps}
        weeklyGoalTotal={weeklyGoalTotal}
        weekRangeLabel={weekRangeLabel}
        canGoPreviousWeek={canGoPreviousWeek}
        canGoNextWeek={canGoNextWeek}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
      />

      <WeeklyStepsBarChart
        weekData={weekData}
        dailyGoal={dailyGoal}
        goalsByDay={goalsByDay}
        todayIndex={todayIndex}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
        progress={barProgress}
      />

      <View style={styles.dayLabelsRow}>
        {weekData.map((day, index) => {
          const isToday = todayIndex >= 0 && index === todayIndex;
          const isSelected = selectedDay === index;
          const pillStyle = getDayLabelPillStyle(isToday, isSelected);
          const textColor = getDayLabelTextColor(isToday);
          const fontVariant = isToday || isSelected ? "bold" : "regular";

          return (
            <View key={index} style={styles.dayLabelCell}>
              <View style={pillStyle}>
                <Pressable onPress={() => onSelectDay(index)} hitSlop={8}>
                  <Text fontSize={11} fontVariant={fontVariant} style={{ color: textColor }}>
                    {day.label}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {detailContent}
    </View>
  );
};

const styles = StyleSheet.create({
  dayLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: 2,
    width: "100%",
  },
  dayLabelCell: {
    alignItems: "center",
    flex: 1,
  },
  todayPill: {
    backgroundColor: PRIMARY_DARK,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  selectedPill: {
    backgroundColor: SELECTED_PILL_BG,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  plainPill: {
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  tapHint: {
    color: MUTED_TEXT_FAINT,
    marginTop: 10,
    textAlign: "center",
  },
});

export default WeeklyStepsChart;
