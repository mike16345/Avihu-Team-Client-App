import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import { getDietPlanV2MealRowVisualState } from "./dietPlanV2MealRowVisualState";

interface DietPlanV2ConsumedBadgeProps {
  consumed: boolean;
}

const DietPlanV2ConsumedBadge = ({ consumed }: DietPlanV2ConsumedBadgeProps) => {
  const visualState = getDietPlanV2MealRowVisualState(consumed);
  const animatedStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(visualState.badgeOpacity, { duration: 150 }),
      transform: [{ scale: withTiming(consumed ? 1 : 0.92, { duration: 150 }) }],
    }),
    [consumed, visualState.badgeOpacity]
  );

  return (
    <Animated.View
      accessibilityElementsHidden={!consumed}
      importantForAccessibility={consumed ? "auto" : "no-hide-descendants"}
      pointerEvents="none"
      style={[
        styles.badge,
        {
          width: visualState.layout.badgeWidth,
          height: visualState.layout.badgeHeight,
        },
        animatedStyle,
      ]}
    >
      <Text fontVariant="bold" fontSize={11} style={styles.label}>
        ✓ נאכל
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#DCFCE7",
  },
  label: {
    color: "#166534",
  },
});

export default DietPlanV2ConsumedBadge;
