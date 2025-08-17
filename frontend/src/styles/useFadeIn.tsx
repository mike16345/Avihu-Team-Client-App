import { useRef, useEffect } from "react";
import { Animated } from "react-native";

export function useFadeIn(duration = 500) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [duration, opacity]);

  return opacity;
}
