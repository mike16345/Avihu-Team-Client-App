import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, View, Dimensions } from "react-native";

interface LoaderProps {
  variant?: `Screen` | `Standard`;
  positionTop?: string | number;
  positionLeft?: string | number;
}

const Loader: React.FC<LoaderProps> = ({
  variant = `Standard`,
  positionLeft = 0,
  positionTop = 0,
}) => {
  const { layout, colors, spacing, common } = useStyles();
  const { height, width } = Dimensions.get(`screen`);
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
    <View
      style={
        variant === `Standard`
          ? [layout.flexRow, layout.flex1, layout.center, spacing.gapXxl, colors.background]
          : [
              [
                layout.flexRow,
                layout.center,
                spacing.gapXxl,
                {
                  height: height,
                  width: width,
                  position: `absolute`,
                  backgroundColor: `rgba(0, 0, 0, 0.8)`,
                  zIndex: 100,
                  top: positionTop,
                  left: positionLeft,
                },
                colors.backdrop,
              ],
            ]
      }
    >
      <Animated.View
        style={[
          { height: 0.5, width: 0.5, transform: [{ scale: scaleAnim1 }] },
          colors.backgroundPrimary,
          common.roundedFull,
        ]}
      />
      <Animated.View
        style={[
          { height: 0.5, width: 0.5, transform: [{ scale: scaleAnim2 }] },
          colors.backgroundPrimary,
          common.roundedFull,
        ]}
      />
      <Animated.View
        style={[
          { height: 0.5, width: 0.5, transform: [{ scale: scaleAnim3 }] },
          colors.backgroundPrimary,
          common.roundedFull,
        ]}
      />
    </View>
  );
};

export default Loader;
