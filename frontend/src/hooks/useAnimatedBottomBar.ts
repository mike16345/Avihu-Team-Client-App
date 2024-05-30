import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useLayoutStore } from "@/store/layoutStore";

const useAnimateBottomBar = () => {
  const displayBottomBar = useLayoutStore((state) => state.isNavbarOpen);
  const animatedValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: displayBottomBar ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [displayBottomBar, animatedValue]);

  return animatedValue;
};

export default useAnimateBottomBar;
