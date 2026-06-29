import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedProps,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Line, Rect, Stop } from "react-native-svg";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import {
  BASELINE_LINE,
  DayData,
  GREEN_DARK,
  GREEN_LIGHT,
  GREEN_MID,
  LIGHT_TEXT_ON_DARK,
  PRIMARY_DARK,
  RED_DARK,
  RED_LIGHT,
  RED_MID,
  TARGET_LINE,
} from "./stepsConstants";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CHART_WIDTH = 300;
const CHART_HEIGHT = 145;
const BAR_AREA_TOP = 18;
const BAR_AREA_BOTTOM = CHART_HEIGHT - 22;
const BAR_AREA_HEIGHT = BAR_AREA_BOTTOM - BAR_AREA_TOP;
const BAR_WIDTH = 22;
const LOW_THRESHOLD_RATIO = 0.3;

interface WeeklyStepsBarChartProps {
  weekData: DayData[];
  dailyGoal: number;
  goalsByDay?: number[];
  todayIndex: number;
  selectedDay: number;
  onSelectDay: (index: number) => void;
  progress: SharedValue<number>;
}

interface AnimatedBarProps {
  progress: SharedValue<number>;
  x: number;
  barHeight: number;
  fill: string;
  opacity: number;
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({ progress, x, barHeight, fill, opacity }) => {
  const animatedProps = useAnimatedProps(() => {
    const height = barHeight * progress.value;

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

const getChartMaxValue = (weekData: DayData[], dailyGoal: number, goalsByDay?: number[]) =>
  Math.max(...(goalsByDay ?? [dailyGoal]), dailyGoal, ...weekData.map((day) => day.steps ?? 0));

const WeeklyStepsBarChart: React.FC<WeeklyStepsBarChartProps> = ({
  weekData,
  dailyGoal,
  goalsByDay,
  todayIndex,
  selectedDay,
  onSelectDay,
  progress,
}) => {
  const { layout } = useStyles();

  const selectedGoal = goalsByDay?.[selectedDay] ?? dailyGoal;
  const maxValue = getChartMaxValue(weekData, dailyGoal, goalsByDay);
  const targetY = BAR_AREA_BOTTOM - (selectedGoal / maxValue) * BAR_AREA_HEIGHT;
  const barSlot = CHART_WIDTH / weekData.length;
  const todayStepsValue = todayIndex >= 0 ? weekData[todayIndex]?.steps : null;
  const showTodayBaselineDot =
    todayIndex >= 0 && (todayStepsValue == null || todayStepsValue === 0);

  return (
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
              progress={progress}
              x={centerX - BAR_WIDTH / 2}
              barHeight={barHeight}
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
  );
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
});

export default WeeklyStepsBarChart;
