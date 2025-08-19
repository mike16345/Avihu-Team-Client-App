import Icon from "@/components/Icon/Icon";
import useColors from "@/styles/useColors";
import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

const SpinningIcon: React.FC<{ mode: "dark" | "light" }> = ({ mode = "dark" }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  const { textPrimary, textOnPrimary } = useColors();

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500, // 1 second per rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Icon
        name="loader"
        color={mode == "dark" ? textOnPrimary.color : textPrimary.color}
        variant="outline"
      />
    </Animated.View>
  );
};

export default SpinningIcon;
