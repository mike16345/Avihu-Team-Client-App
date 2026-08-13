import { useEffect, type ComponentProps, type ComponentType } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimateProps,
} from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import { DIET_V2_GREEN, DIET_V2_MUTED, DropIcon, DrumstickIcon, SproutIcon } from "./dietV2Icons";
import {
  formatDietPlanV2Number,
  getDietPlanV2CalorieTarget,
  type DietPlanV2Totals,
} from "./dietPlanV2Utils";

interface DietPlanV2HeaderProps {
  totals: DietPlanV2Totals;
  consumed: DietPlanV2Totals;
}

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number;
  Icon: React.FC<{ size?: number; color?: string }>;
}

const RING_SIZE = 132;
const RING_STROKE = 11;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const PROGRESS_DURATION = 420;
const PROGRESS_EASING = Easing.out(Easing.cubic);
const AnimatedCircle = Animated.createAnimatedComponent(Circle) as ComponentType<
  AnimateProps<ComponentProps<typeof Circle>>
>;

const clampProgress = (consumed: number, target: number) =>
  target > 0 ? Math.max(0, Math.min(1, consumed / target)) : 0;

const AnimatedValue = ({ value, style }: { value: number; style: object }) => {
  const formatted = formatDietPlanV2Number(value);

  return (
    <View style={styles.animatedValueClip}>
      <Animated.View
        key={formatted}
        entering={FadeInUp.duration(190).easing(PROGRESS_EASING)}
        exiting={FadeOutUp.duration(130).easing(PROGRESS_EASING)}
      >
        <Text fontVariant="bold" fontSize={28} style={style}>
          {formatted}
        </Text>
      </Animated.View>
    </View>
  );
};

const AnimatedBarValue = ({ consumed, target }: { consumed: number; target: number }) => {
  const label = `${formatDietPlanV2Number(consumed)} / ${formatDietPlanV2Number(target)} ג'`;

  return (
    <View style={styles.barValueClip}>
      <Animated.View
        key={label}
        entering={FadeInUp.duration(180).easing(PROGRESS_EASING)}
        exiting={FadeOutUp.duration(120).easing(PROGRESS_EASING)}
      >
        <Text fontSize={12} style={styles.barValue}>
          {label}
        </Text>
      </Animated.View>
    </View>
  );
};

const CalorieRing = ({ consumed, target }: { consumed: number; target: number }) => {
  const progress = useSharedValue(clampProgress(consumed, target));

  useEffect(() => {
    progress.value = withTiming(clampProgress(consumed, target), {
      duration: PROGRESS_DURATION,
      easing: PROGRESS_EASING,
    });
  }, [consumed, progress, target]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={styles.ringWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#E5E7EB"
          strokeWidth={RING_STROKE}
          fill="transparent"
        />
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={DIET_V2_GREEN}
          strokeWidth={RING_STROKE}
          fill="transparent"
          strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <AnimatedValue value={consumed} style={styles.ringValue} />
        <Text fontSize={12} style={styles.ringTarget}>
          {`${formatDietPlanV2Number(target)} קק"ל`}
        </Text>
      </View>
    </View>
  );
};

const MacroBar = ({ label, consumed, target, Icon }: MacroBarProps) => {
  const progress = useSharedValue(clampProgress(consumed, target));

  useEffect(() => {
    progress.value = withTiming(clampProgress(consumed, target), {
      duration: PROGRESS_DURATION,
      easing: PROGRESS_EASING,
    });
  }, [consumed, progress, target]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.bar}>
      <View style={styles.barHeader}>
        <View style={styles.barLabelWrap}>
          <Icon size={14} color={DIET_V2_GREEN} />
          <Text fontSize={13} fontVariant="semibold" style={styles.barLabel}>
            {label}
          </Text>
        </View>
        <AnimatedBarValue consumed={consumed} target={target} />
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
};

const DietPlanV2Header = ({ totals, consumed }: DietPlanV2HeaderProps) => {
  const targetCalories = getDietPlanV2CalorieTarget(totals);

  return (
    <View style={styles.row}>
      <View style={styles.barsWrap}>
        <MacroBar
          label="חלבון"
          consumed={consumed.protein}
          target={totals.protein}
          Icon={DrumstickIcon}
        />
        <MacroBar
          label="פחמימה"
          consumed={consumed.carbs}
          target={totals.carbs}
          Icon={SproutIcon}
        />
        <MacroBar label="שומן" consumed={consumed.fat} target={totals.fat} Icon={DropIcon} />
      </View>
      <CalorieRing consumed={consumed.calories} target={targetCalories} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  animatedValueClip: {
    minWidth: 76,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ringValue: {
    color: "#0B2A22",
    lineHeight: 30,
    writingDirection: "ltr",
    fontVariant: ["tabular-nums"],
  },
  ringTarget: {
    color: "#6B7280",
    lineHeight: 13,
    marginTop: 1,
    writingDirection: "ltr",
  },
  barsWrap: {
    flex: 1,
    gap: 14,
  },
  bar: {
    gap: 6,
    alignSelf: "stretch",
  },
  barHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  barLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  barLabel: {
    color: "#0B2A22",
  },
  barValue: {
    color: DIET_V2_MUTED,
    writingDirection: "ltr",
    fontVariant: ["tabular-nums"],
  },
  barValueClip: {
    minWidth: 88,
    height: 18,
    alignItems: "flex-end",
    justifyContent: "center",
    overflow: "hidden",
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    flexDirection: "row",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: DIET_V2_GREEN,
  },
});

export default DietPlanV2Header;
