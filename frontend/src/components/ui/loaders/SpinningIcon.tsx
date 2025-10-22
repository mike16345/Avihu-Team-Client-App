import Icon from "@/components/Icon/Icon";
import useColors from "@/styles/useColors";
import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface SpinningIconProps {
  mode?: "dark" | "light";
}

const duration = 800;
const easing = Easing.bezier(0.25, -0.5, 0.25, 1);

const SpinningIcon: React.FC<SpinningIconProps> = ({ mode = "dark" }) => {
  const { textPrimary, textOnPrimary } = useColors();

  // Shared value for rotation
  const rotation = useSharedValue(0);

  // Start continuous rotation once
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(1, {
        duration,
        easing,
      }),
      -1 // infinite
    );
  }, []);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon
        name="loader"
        color={mode === "dark" ? textOnPrimary.color : textPrimary.color}
        variant="outline"
      />
    </Animated.View>
  );
};

export default SpinningIcon;
