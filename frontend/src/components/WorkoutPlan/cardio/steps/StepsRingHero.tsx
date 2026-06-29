import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
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

interface StepsRingHeroProps {
  todaySteps: number;
  dailyGoal: number;
  ringSize: number;
  ringValueFont: number;
  titleFont: number;
  ringTextGap: number;
}

const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const StepsRingHero: React.FC<StepsRingHeroProps> = ({
  todaySteps,
  dailyGoal,
  ringSize,
  ringValueFont,
  titleFont,
  ringTextGap,
}) => {
  const { colors, layout } = useStyles();
  const progress = useSharedValue(0);

  const targetProgress = Math.min(todaySteps / dailyGoal, 1);
  const remaining = Math.max(dailyGoal - todaySteps, 0);
  const subtitleText = remaining > 0 ? `עוד ${formatSteps(remaining)} צעדים` : "השגת את היעד! 🎯";

  useFocusEffect(
    useCallback(() => {
      progress.value = 0;
      progress.value = withTiming(targetProgress, {
        duration: 1800,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      return () => {
        cancelAnimation(progress);
      };
    }, [progress, targetProgress])
  );

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={[layout.flexRow, layout.itemsCenter, layout.justifyCenter, { gap: ringTextGap }]}>
      <View style={styles.titleColumn}>
        <Text
          fontVariant="bold"
          fontSize={titleFont}
          numberOfLines={2}
          style={[colors.textPrimary, styles.title]}
        >
          מטרה צעדים יומית
        </Text>
        <Text fontSize={14} style={styles.subtitle}>
          {subtitleText}
        </Text>
      </View>
      <View style={{ width: ringSize, height: ringSize }}>
        <Svg viewBox="0 0 120 120" width="100%" height="100%">
          <Defs>
            <LinearGradient id="stepsRingGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={RING_GRAD_START} />
              <Stop offset="0.5" stopColor={GREEN_DARK} />
              <Stop offset="1" stopColor={RING_GRAD_END} />
            </LinearGradient>
          </Defs>
          <Circle
            cx="60"
            cy="60"
            r={RING_RADIUS}
            stroke={RING_TRACK}
            strokeWidth="11"
            fill="none"
          />
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

        <View style={[layout.absolute, styles.ringValueOverlay, layout.center]}>
          <Text
            fontVariant="bold"
            fontSize={ringValueFont}
            numberOfLines={1}
            style={colors.textPrimary}
          >
            {formatSteps(todaySteps)}
          </Text>
          <Text fontSize={12} style={styles.ringSubvalue}>
            / {formatSteps(dailyGoal)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ringValueOverlay: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ringSubvalue: {
    color: MUTED_TEXT,
  },
  titleColumn: {
    flexShrink: 1,
    alignItems: "flex-end",
  },
  title: {
    textAlign: "right",
  },
  subtitle: {
    color: MUTED_TEXT,
    marginTop: 6,
    textAlign: "right",
  },
});

export default StepsRingHero;
