import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

const Loader = () => {
  const { layout, colors, spacing } = useStyles();
  // Create animated value
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;
  const scaleAnim3 = useRef(new Animated.Value(1)).current;

  const startPulse = (anim: Animated.Value) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 50,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startPulse(scaleAnim1);
    setTimeout(() => {
      startPulse(scaleAnim2);
    }, 300);
    setTimeout(() => {
      startPulse(scaleAnim3);
    }, 600);
  }, []);

  return (
    <View style={[layout.flexRow, layout.heightFull, layout.center, spacing.gapXxl]}>
      <Animated.View
        style={[
          { height: 0.5, width: 0.5 },
          colors.backgroundPrimary,
          { borderRadius: 100, transform: [{ scale: scaleAnim1 }] },
        ]}
      />
      <Animated.View
        style={[
          { height: 0.5, width: 0.5 },
          colors.backgroundPrimary,
          { borderRadius: 100, transform: [{ scale: scaleAnim2 }] },
        ]}
      />
      <Animated.View
        style={[
          { height: 0.5, width: 0.5 },
          colors.backgroundPrimary,
          { borderRadius: 100, transform: [{ scale: scaleAnim3 }] },
        ]}
      />
    </View>
  );
};

export default Loader;
