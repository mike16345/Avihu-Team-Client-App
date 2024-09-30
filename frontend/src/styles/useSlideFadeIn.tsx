import { useEffect, useRef } from "react";
import { Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const useSlideFadeIn = (direction: string, delay = 0) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 800,
        delay: delay, // Set the delay here
        useNativeDriver: false,
      }).start();
    };

    const timer = setTimeout(startAnimation, delay);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [animatedValue, delay]);

  const getStyle = () => {
    switch (direction) {
      case "top":
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-height, 0],
              }),
            },
          ],
          opacity: animatedValue,
        };
      case "bottom":
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0],
              }),
            },
          ],
          opacity: animatedValue,
        };
      case "left":
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-width, 0],
              }),
            },
          ],
          opacity: animatedValue,
        };
      case "right":
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [width, 0],
              }),
            },
          ],
          opacity: animatedValue,
        };
      default:
        return {};
    }
  };

  return getStyle();
};

export default useSlideFadeIn;
