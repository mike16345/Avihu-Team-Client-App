import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Easing, cancelAnimation, useSharedValue, withTiming } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { formatSteps } from "@/utils/stepsUtils";
import { MUTED_TEXT } from "./stepsConstants";
import StepsProgressRing from "./StepsProgressRing";

interface StepsRingHeroProps {
  todaySteps: number;
  dailyGoal: number;
  ringSize: number;
  ringValueFont: number;
  titleFont: number;
  ringTextGap: number;
}

const StepsRingHero: React.FC<StepsRingHeroProps> = ({
  todaySteps,
  dailyGoal,
  ringSize,
  ringValueFont,
  titleFont,
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

  return (
    <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
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
      <StepsProgressRing
        todaySteps={todaySteps}
        dailyGoal={dailyGoal}
        ringSize={ringSize}
        ringValueFont={ringValueFont}
        progress={progress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  titleColumn: {
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
