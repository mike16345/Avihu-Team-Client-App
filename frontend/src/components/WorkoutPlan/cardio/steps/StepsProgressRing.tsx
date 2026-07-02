import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { SharedValue, useAnimatedProps } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { formatSteps } from "@/utils/stepsUtils";
import {
  GREEN_DARK,
  MUTED_TEXT,
  RING_GRAD_END,
  RING_GRAD_START,
  RING_TRACK,
} from "./stepsConstants";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface StepsProgressRingProps {
  dailyGoal: number;
  progress: SharedValue<number>;
  ringSize: number;
  ringValueFont: number;
  todaySteps: number;
}

const StepsProgressRing: React.FC<StepsProgressRingProps> = ({
  dailyGoal,
  progress,
  ringSize,
  ringValueFont,
  todaySteps,
}) => {
  const { colors, layout } = useStyles();

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={{ width: ringSize, height: ringSize }}>
      <Svg viewBox="0 0 120 120" width="100%" height="100%">
        <Defs>
          <LinearGradient id="stepsRingGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={RING_GRAD_START} />
            <Stop offset="0.5" stopColor={GREEN_DARK} />
            <Stop offset="1" stopColor={RING_GRAD_END} />
          </LinearGradient>
        </Defs>
        <Circle cx="60" cy="60" r={RING_RADIUS} stroke={RING_TRACK} strokeWidth="11" fill="none" />
        <AnimatedCircle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          stroke="url(#stepsRingGrad)"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${RING_CIRCUMFERENCE}`}
          transform="rotate(-90 60 60)"
          animatedProps={ringAnimatedProps}
        />
      </Svg>

      <View style={[layout.absolute, layout.center, styles.valueOverlay]}>
        <Text
          fontVariant="bold"
          fontSize={ringValueFont}
          numberOfLines={1}
          style={colors.textPrimary}
        >
          {formatSteps(todaySteps)}
        </Text>
        <Text fontSize={12} style={styles.subvalue}>
          / {formatSteps(dailyGoal)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  valueOverlay: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  subvalue: {
    color: MUTED_TEXT,
  },
});

export default StepsProgressRing;
