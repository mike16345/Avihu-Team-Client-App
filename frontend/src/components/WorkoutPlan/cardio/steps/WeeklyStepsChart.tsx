import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Animated, {
  Easing,
  SharedValue,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Line, Rect, Stop } from "react-native-svg";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { useShadowStyles } from "@/styles/useShadowStyles";
import {
  BASELINE_LINE,
  DAY_LABEL_TEXT,
  DayData,
  GREEN_DARK,
  GREEN_LIGHT,
  GREEN_MID,
  LIGHT_TEXT_ON_DARK,
  MUTED_TEXT_FAINT,
  PRIMARY_DARK,
  RED_DARK,
  RED_LIGHT,
  RED_MID,
  SELECTED_PILL_BG,
  TARGET_LINE,
} from "./stepsConstants";
import DayDetailPanel from "./DayDetailPanel";
import WeeklyStepsChartHeader from "./WeeklyStepsChartHeader";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CHART_WIDTH = 300;
const CHART_HEIGHT = 145;
const BAR_AREA_TOP = 18;
const BAR_AREA_BOTTOM = CHART_HEIGHT - 22;
const BAR_AREA_HEIGHT = BAR_AREA_BOTTOM - BAR_AREA_TOP;
const BAR_WIDTH = 22;
const LOW_THRESHOLD_RATIO = 0.3;

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

interface AnimatedBarProps {
  progress: SharedValue<number>;
  x: number;
  barH: number;
  fill: string;
  opacity: number;
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({ progress, x, barH, fill, opacity }) => {
  const animatedProps = useAnimatedProps(() => {
    const height = barH * progress.value;

    return {
      height,
      y: BAR_AREA_BOTTOM - height,
    };
  });

  return (
    <AnimatedRect
      x={x}
      width={BAR_WIDTH}
      rx={BAR_WIDTH / 2}
      ry={BAR_WIDTH / 2}
      fill={fill}
      opacity={opacity}
      animatedProps={animatedProps}
    />
  );
};

const getDayLabelPillStyle = (isToday: boolean, isSelected: boolean) => {
  if (isToday) {
    return styles.todayPill;
  }

  if (isSelected) {
    return styles.selectedPill;
  }

  return styles.plainPill;
};

const getDayLabelTextColor = (isToday: boolean) => (isToday ? LIGHT_TEXT_ON_DARK : DAY_LABEL_TEXT);

const getSelectedGoal = (selectedDay: number, dailyGoal: number, goalsByDay?: number[]) =>
  goalsByDay?.[selectedDay] ?? dailyGoal;

const getWeeklyGoalTotal = (weekLength: number, dailyGoal: number, goalsByDay?: number[]) =>
  (goalsByDay ?? Array(weekLength).fill(dailyGoal)).reduce((sum, goal) => sum + goal, 0);

const getChartMaxValue = (weekData: DayData[], dailyGoal: number, goalsByDay?: number[]) =>
  Math.max(...(goalsByDay ?? [dailyGoal]), dailyGoal, ...weekData.map((day) => day.steps ?? 0));

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
  const { colors, common, frameShadow, layout, spacing } = useChartStyles();
  const barProgress = useSharedValue(0);

  const selectedGoal = getSelectedGoal(selectedDay, dailyGoal, goalsByDay);
  const weeklyGoalTotal = getWeeklyGoalTotal(weekData.length, dailyGoal, goalsByDay);
  const totalSteps = weekData.reduce((sum, day) => sum + (day.steps ?? 0), 0);
  const maxValue = getChartMaxValue(weekData, dailyGoal, goalsByDay);
  const targetY = BAR_AREA_BOTTOM - (selectedGoal / maxValue) * BAR_AREA_HEIGHT;
  const barSlot = CHART_WIDTH / weekData.length;
  const selectedDetail = weekData[selectedDay];
  const todayStepsValue = todayIndex >= 0 ? weekData[todayIndex]?.steps : null;
  const showTodayBaselineDot =
    todayIndex >= 0 && (todayStepsValue == null || todayStepsValue === 0);

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
    <View style={[colors.backgroundSurface, common.roundedXl, spacing.pdMd, frameShadow]}>
      <WeeklyStepsChartHeader
        totalSteps={totalSteps}
        weeklyGoalTotal={weeklyGoalTotal}
        weekRangeLabel={weekRangeLabel}
        canGoPreviousWeek={canGoPreviousWeek}
        canGoNextWeek={canGoNextWeek}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
      />

      <View style={styles.chartArea}>
        <Svg
          width="100%"
          height={CHART_HEIGHT}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="weeklyGreenBar" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={GREEN_LIGHT} />
              <Stop offset="0.6" stopColor={GREEN_MID} />
              <Stop offset="1" stopColor={GREEN_DARK} />
            </LinearGradient>
            <LinearGradient id="weeklyRedBar" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={RED_LIGHT} />
              <Stop offset="0.6" stopColor={RED_MID} />
              <Stop offset="1" stopColor={RED_DARK} />
            </LinearGradient>
          </Defs>

          <Line
            x1="6"
            x2={CHART_WIDTH - 6}
            y1={targetY}
            y2={targetY}
            stroke={TARGET_LINE}
            strokeWidth="1"
            strokeDasharray="3,3"
          />

          <Line
            x1="6"
            x2={CHART_WIDTH - 6}
            y1={BAR_AREA_BOTTOM + 0.5}
            y2={BAR_AREA_BOTTOM + 0.5}
            stroke={BASELINE_LINE}
            strokeWidth="1"
          />

          {weekData.map((day, index) => {
            if (day.steps == null || day.steps === 0) {
              return null;
            }

            const dayGoal = goalsByDay?.[index] ?? dailyGoal;
            const isLow = day.steps < dayGoal * LOW_THRESHOLD_RATIO;
            const centerX = CHART_WIDTH - (index + 0.5) * barSlot;
            const barHeight = Math.max((day.steps / maxValue) * BAR_AREA_HEIGHT, 6);

            return (
              <AnimatedBar
                key={index}
                progress={barProgress}
                x={centerX - BAR_WIDTH / 2}
                barH={barHeight}
                fill={isLow ? "url(#weeklyRedBar)" : "url(#weeklyGreenBar)"}
                opacity={selectedDay === index ? 1 : 0.5}
              />
            );
          })}

          {showTodayBaselineDot ? (
            <Circle
              cx={CHART_WIDTH - (todayIndex + 0.5) * barSlot}
              cy={BAR_AREA_BOTTOM - 4}
              r="3"
              fill={PRIMARY_DARK}
            />
          ) : null}
        </Svg>

        <View style={[styles.targetPill, { top: targetY - 9 }]} pointerEvents="none">
          <Text fontSize={10} fontVariant="bold" style={styles.targetPillText}>
            יעד {(selectedGoal / 1000).toFixed(selectedGoal % 1000 ? 1 : 0)}K
          </Text>
        </View>

        <View style={[layout.absolute, styles.barHitArea]}>
          {weekData.map((_, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 4, left: 2, right: 2 }}
              onPress={() => onSelectDay(index)}
              style={styles.barHitItem}
            />
          ))}
        </View>
      </View>

      <View style={styles.dayLabelsRow}>
        {weekData.map((day, index) => {
          const isToday = todayIndex >= 0 && index === todayIndex;
          const isSelected = selectedDay === index;

          return (
            <View key={index} style={styles.dayLabelCell}>
              <View style={getDayLabelPillStyle(isToday, isSelected)}>
                <Text
                  fontSize={11}
                  fontVariant={isToday || isSelected ? "bold" : "regular"}
                  style={{ color: getDayLabelTextColor(isToday) }}
                >
                  {day.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {selectedDetail ? (
        <DayDetailPanel detail={selectedDetail} detailValueFont={detailValueFont} />
      ) : (
        <Text fontSize={11} style={styles.tapHint}>
          לחץ על יום לפרטים
        </Text>
      )}
    </View>
  );
};

const useChartStyles = () => {
  const { colors, common, layout, spacing } = useStyles();
  const { frameShadow } = useShadowStyles();

  return { colors, common, frameShadow, layout, spacing };
};

const styles = StyleSheet.create({
  chartArea: {
    height: CHART_HEIGHT,
    position: "relative",
    width: "100%",
  },
  targetPill: {
    backgroundColor: PRIMARY_DARK,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 1,
    position: "absolute",
    right: 4,
  },
  targetPillText: {
    color: LIGHT_TEXT_ON_DARK,
  },
  barHitArea: {
    bottom: 22,
    flexDirection: "row",
    left: 0,
    right: 0,
    top: 0,
  },
  barHitItem: {
    flex: 1,
  },
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
