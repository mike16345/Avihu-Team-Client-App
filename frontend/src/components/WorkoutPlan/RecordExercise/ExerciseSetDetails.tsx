import { Text } from "@/components/ui/Text";
import { ISet } from "@/interfaces/Workout";
import useColors from "@/styles/useColors";
import useCommonStyles from "@/styles/useCommonStyles";
import { useSpacingStyles } from "@/styles/useSpacingStyles";
import useMonthlyExerciseGoals from "@/hooks/queries/useMonthlyExerciseGoals";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, View } from "react-native";

interface ExerciseSetDetailsProps {
  sets: ISet[];
  exerciseMethod?: string;
  exerciseName?: string;
}

const ExerciseSetDetails: FC<ExerciseSetDetailsProps> = ({
  sets,
  exerciseMethod,
  exerciseName,
}) => {
  const { backgroundSurface } = useColors();
  const { pdVerticalXs, pdHorizontalMd } = useSpacingStyles();
  const { roundedSm } = useCommonStyles();
  const { data: goals } = useMonthlyExerciseGoals();
  const goal = useMemo(
    () =>
      exerciseName
        ? (goals ?? []).find((g) => g.exercise?.trim() === exerciseName.trim())
        : undefined,
    [goals, exerciseName]
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const details = useMemo(() => {
    let details = "";
    if (!sets || !sets.length) return details;

    // prefer min/max; fall back to reps/targetReps if needed
    const mins = sets.map((s) => [s.minReps].find((v) => Number.isFinite(v)) as number);
    const maxs = sets.map((s) => [s.maxReps, s.minReps].find((v) => Number.isFinite(v)) as number);

    const allEqual = (arr: number[]) => arr.every((v) => v === arr[0]);

    const prefix = exerciseMethod ? `${exerciseMethod}:` : "עבודה: ";
    const countPart = `${sets.length} סטים`;

    // Case 1: all sets same exact reps (e.g., 10)
    if (allEqual(mins) && allEqual(maxs) && mins[0] === maxs[0]) {
      details = `${prefix} ${countPart} ${mins[0]} חזרות`;
    }
    // Case 2: all sets share same min–max range (e.g., 8–12)
    else if (allEqual(mins) && allEqual(maxs)) {
      const includeMax = maxs[0] !== 0;
      const reps = includeMax ? `${mins[0]}–${maxs[0]}` : mins[0];
      details = `${prefix}${countPart} ${reps} חזרות`;
    }
    // Case 3: different per-set (use minReps only, e.g., 8 | 10 | 12 | 14)
    else {
      details = `${prefix} ${mins.join(" | ")}`;
    }

    return details.replace(/\([^)]*[A-Za-z][^)]*\)/g, "").trim();
  }, [sets, exerciseMethod]);

  const items = useMemo(() => {
    const arr: string[] = [];
    if (details) arr.push(details);
    if (goal) arr.push(`🎯 יעד: ${goal.targetWeight} ק"ג × ${goal.targetReps} חזרות`);
    return arr;
  }, [details, goal]);

  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setInterval(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(translateY, { toValue: -6, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      ]).start(() => {
        setIndex((i) => (i + 1) % items.length);
        translateY.setValue(6);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        ]).start();
      });
    }, 4500);
    return () => clearInterval(t);
  }, [paused, items.length, opacity, translateY]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  if (items.length === 0) return null;
  const active = items[Math.min(index, items.length - 1)];

  return (
    <Pressable onPress={() => setPaused(true)}>
      <View
        style={[
          backgroundSurface,
          pdVerticalXs,
          pdHorizontalMd,
          roundedSm,
          { minHeight: 36, justifyContent: "center" },
        ]}
      >
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
          <Text fontVariant="semibold" fontSize={16}>
            {active}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
};

export default ExerciseSetDetails;
