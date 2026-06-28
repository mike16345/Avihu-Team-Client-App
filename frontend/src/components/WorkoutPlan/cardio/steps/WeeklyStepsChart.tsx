import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Circle, Defs, LinearGradient, Line, Rect, Stop } from "react-native-svg";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { useShadowStyles } from "@/styles/useShadowStyles";
import Icon from "@/components/Icon/Icon";
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
  formatSteps,
} from "./stepsConstants";
import DayDetailPanel from "./DayDetailPanel";

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
  onPressHistory?: () => void;
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
    const h = barH * progress.value;
    return {
      height: h,
      y: BAR_AREA_BOTTOM - h,
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
  if (isToday) return styles.todayPill;
  if (isSelected) return styles.selectedPill;
  return styles.plainPill;
};

const getDayLabelTextColor = (isToday: boolean) =>
  isToday ? LIGHT_TEXT_ON_DARK : DAY_LABEL_TEXT;

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
  onPressHistory,
}) => {
  const { colors, common, frameShadow, spacing, layout } = useChartStyles();
  const barProgress = useSharedValue(0);

  const selectedGoal = goalsByDay?.[selectedDay] ?? dailyGoal;
  const maxValue = Math.max(
    ...(goalsByDay ?? [dailyGoal]),
    dailyGoal,
    ...weekData.map((d) => d.steps ?? 0)
  );
  const targetY = BAR_AREA_BOTTOM - (selectedGoal / maxValue) * BAR_AREA_HEIGHT;
  const barSlot = CHART_WIDTH / weekData.length;

  const todayStepsValue = todayIndex >= 0 ? weekData[todayIndex]?.steps : null;
  const showTodayBaselineDot = todayIndex >= 0 && (todayStepsValue == null || todayStepsValue === 0);

  const totalSteps = weekData.reduce((sum, d) => sum + (d.steps ?? 0), 0);
  const weeklyGoalTotal = (goalsByDay ?? Array(weekData.length).fill(dailyGoal)).reduce(
    (s, g) => s + g,
    0
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

  const detail = weekData[selectedDay];

  return (
    <View style={[colors.backgroundSurface, common.roundedXl, spacing.pdMd, frameShadow]}>
      <View style={[layout.flexRowReverse, layout.justifyBetween, layout.itemsCenter, styles.headerRow]}>
        <View style={styles.headerInfo}>
          <Text fontSize={12} fontVariant="semibold" style={styles.weeklyTotal}>
            סה״כ השבוע: {formatSteps(weeklyGoalTotal)} צעדים
          </Text>
          {weekRangeLabel && (
            <Text fontSize={10} fontVariant="semibold" style={styles.weekRange}>
              {weekRangeLabel}
            </Text>
          )}
          <Text fontSize={11} fontVariant="semibold" style={styles.weeklyCompleted}>
            נעשו: {formatSteps(totalSteps)} צעדים
          </Text>
        </View>
        <View style={styles.weekNavRow}>
          <TouchableOpacity
            activeOpacity={0.6}
            hitSlop={8}
            disabled={!canGoPreviousWeek}
            onPress={onPreviousWeek}
            style={[styles.weekNavButton, !canGoPreviousWeek && styles.weekNavButtonDisabled]}
          >
            <Icon
              name="chevronRightSoft"
              width={20}
              height={20}
              color={canGoPreviousWeek ? PRIMARY_DARK : MUTED_TEXT_FAINT}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            hitSlop={8}
            disabled={!canGoNextWeek}
            onPress={onNextWeek ?? onPressHistory}
            style={[styles.weekNavButton, !canGoNextWeek && styles.weekNavButtonDisabled]}
          >
            <Icon
              name="chevronLeftSoft"
              width={20}
              height={20}
              color={canGoNextWeek ? PRIMARY_DARK : MUTED_TEXT_FAINT}
            />
          </TouchableOpacity>
        </View>
      </View>

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

          {weekData.map((day, i) => {
            if (day.steps == null || day.steps === 0) return null;
            const dayGoal = goalsByDay?.[i] ?? dailyGoal;
            const isLow = day.steps < dayGoal * LOW_THRESHOLD_RATIO;
            const cx = CHART_WIDTH - (i + 0.5) * barSlot;
            const barH = Math.max((day.steps / maxValue) * BAR_AREA_HEIGHT, 6);
            return (
              <AnimatedBar
                key={i}
                progress={barProgress}
                x={cx - BAR_WIDTH / 2}
                barH={barH}
                fill={isLow ? "url(#weeklyRedBar)" : "url(#weeklyGreenBar)"}
                opacity={selectedDay === i ? 1 : 0.5}
              />
            );
          })}

          {showTodayBaselineDot && (
            <Circle
              cx={CHART_WIDTH - (todayIndex + 0.5) * barSlot}
              cy={BAR_AREA_BOTTOM - 4}
              r="3"
              fill={PRIMARY_DARK}
            />
          )}
        </Svg>

        <View style={[styles.targetPill, { top: targetY - 9 }]} pointerEvents="none">
          <Text fontSize={10} fontVariant="bold" style={styles.targetPillText}>
            יעד {(selectedGoal / 1000).toFixed(selectedGoal % 1000 ? 1 : 0)}K
          </Text>
        </View>

        <View style={[layout.absolute, styles.barHitArea]}>
          {weekData.map((_, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 4, left: 2, right: 2 }}
              onPress={() => onSelectDay(i)}
              style={styles.barHitItem}
            />
          ))}
        </View>
      </View>

      <View style={styles.dayLabelsRow}>
        {weekData.map((day, i) => {
          const isToday = todayIndex >= 0 && i === todayIndex;
          const isSelected = selectedDay === i;
          return (
            <View key={i} style={styles.dayLabelCell}>
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

      {detail ? (
        <DayDetailPanel detail={detail} detailValueFont={detailValueFont} />
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
  return { colors, common, layout, spacing, frameShadow };
};

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: 10,
  },
  weeklyTotal: {
    color: "rgba(7,39,35,0.4)",
  },
  headerInfo: {
    alignItems: "flex-end",
    flex: 1,
  },
  weekRange: {
    color: MUTED_TEXT_FAINT,
    marginTop: 2,
  },
  weeklyCompleted: {
    color: GREEN_DARK,
    marginTop: 2,
  },
  weekNavRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  weekNavButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "rgba(7,39,35,0.06)",
  },
  weekNavButtonDisabled: {
    opacity: 0.35,
  },
  chartArea: {
    width: "100%",
    height: CHART_HEIGHT,
    position: "relative",
  },
  targetPill: {
    position: "absolute",
    right: 4,
    backgroundColor: PRIMARY_DARK,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 999,
  },
  targetPillText: {
    color: LIGHT_TEXT_ON_DARK,
  },
  barHitArea: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 22,
    flexDirection: "row",
  },
  barHitItem: {
    flex: 1,
  },
  dayLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: 2,
  },
  dayLabelCell: {
    flex: 1,
    alignItems: "center",
  },
  todayPill: {
    backgroundColor: PRIMARY_DARK,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 999,
  },
  selectedPill: {
    backgroundColor: SELECTED_PILL_BG,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 999,
  },
  plainPill: {
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  tapHint: {
    color: MUTED_TEXT_FAINT,
    textAlign: "center",
    marginTop: 10,
  },
});

export default WeeklyStepsChart;
