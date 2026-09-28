import Badge from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import useGetLastRecordedSet from "@/hooks/queries/RecordedSets/useLastRecordedSetQuery";
import useMonthlyExerciseGoals from "@/hooks/queries/useMonthlyExerciseGoals";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable } from "react-native";

interface PreviousSetCardProps {
  exercise: string;
  onPress?: () => void;
}

const ROTATE_MS = 4500;
const FADE_MS = 300;

const PreviousSetCard: FC<PreviousSetCardProps> = ({ exercise, onPress }) => {
  const { formattedSets } = useGetLastRecordedSet(exercise);
  const { data: goals } = useMonthlyExerciseGoals();
  const goal = useMemo(
    () =>
      (goals ?? []).find((g) => g.exercise?.trim() === exercise?.trim()),
    [goals, exercise]
  );

  const items = useMemo(() => {
    const arr: string[] = [];
    if (formattedSets.length > 0) {
      arr.push(`עדכון אחרון | ${formattedSets[formattedSets.length - 1]}`);
    }
    if (goal) {
      arr.push(`🎯 יעד: ${goal.targetWeight} ק"ג × ${goal.targetReps} חזרות`);
    }
    return arr;
  }, [formattedSets, goal]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setInterval(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(translateY, { toValue: -6, duration: FADE_MS, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      ]).start(() => {
        setIndex((i) => (i + 1) % items.length);
        translateY.setValue(6);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(translateY, { toValue: 0, duration: FADE_MS, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        ]).start();
      });
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, items.length, opacity, translateY]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  if (items.length === 0) return null;

  const active = items[Math.min(index, items.length - 1)];

  return (
    <Pressable onPress={() => setPaused(true)}>
      <Badge buttonLabel="" onPress={onPress} showButton={!!onPress} showDot>
        <Animated.View
          style={{
            opacity,
            transform: [{ translateY }],
            height: 20,
            justifyContent: "center",
          }}
        >
          <Text
            fontSize={12}
            fontVariant="semibold"
            numberOfLines={1}
            style={{ lineHeight: 18 }}
          >
            {active}
          </Text>
        </Animated.View>
      </Badge>
    </Pressable>
  );
};

export default PreviousSetCard;
