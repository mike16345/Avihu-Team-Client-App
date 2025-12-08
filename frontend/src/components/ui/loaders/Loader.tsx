import useStyles from "@/styles/useGlobalStyles";
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

const Loader = () => {
  const { layout, colors, spacing, common } = useStyles();

  // Create animated values for opacity
  const opacityAnim1 = useRef(new Animated.Value(0)).current;
  const opacityAnim2 = useRef(new Animated.Value(0)).current;
  const opacityAnim3 = useRef(new Animated.Value(0)).current;

  const startPulse = (anim: Animated.Value) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startPulse(opacityAnim1);
    setTimeout(() => startPulse(opacityAnim2), 300);
    setTimeout(() => startPulse(opacityAnim3), 600);
  }, []);

  return (
    <View
      style={[layout.flexRow, layout.flex1, layout.center, spacing.gapDefault, colors.background]}
    >
      <Animated.View
        style={[
          { height: 10, width: 10, opacity: opacityAnim1 },
          colors.backgroundPrimary,
          common.roundedFull,
        ]}
      />
      <Animated.View
        style={[
          { height: 10, width: 10, opacity: opacityAnim2 },
          colors.backgroundPrimary,
          common.roundedFull,
        ]}
      />
      <Animated.View
        style={[
          { height: 10, width: 10, opacity: opacityAnim3 },
          colors.backgroundPrimary,
          common.roundedFull,
        ]}
      />
    </View>
  );
};

export default Loader;
