import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

type Dimension = number | `${number}%` | "auto";
type SkeletonAnimation = "pulse" | "none";

interface SkeletonLoaderProps {
  width?: Dimension;
  height?: Dimension;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  animation?: SkeletonAnimation;
  isLoaded?: boolean;
  children?: React.ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%" as `${number}%`,
  height = 16,
  circle = false,
  style,
  borderRadius,
  animation = "pulse",
  isLoaded = false,
  children,
}) => {
  const { colors, common } = useStyles();
  const opacity = useRef(new Animated.Value(animation === "pulse" ? 0.6 : 1)).current;

  useEffect(() => {
    if (animation !== "pulse" || isLoaded) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [animation, isLoaded, opacity]);

  if (isLoaded && children) return <>{children}</>;

  const computedRadius = circle && typeof width === "number" ? width / 2 : borderRadius;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityRole="progressbar"
      // With Animated + Reanimated types, ensure width/height are Dimension, not generic string
      style={[
        {
          width,
          height,
          opacity,
        },
        colors.backgroundInverseSurface,
        common.rounded,
        computedRadius != null ? { borderRadius: computedRadius } : undefined,
        style,
      ]}
    />
  );
};

export default SkeletonLoader;
