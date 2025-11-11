import { useWindowDimensions, StyleProp, ViewStyle, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import Animated from "react-native-reanimated";
import useStyles from "@/styles/useGlobalStyles";

interface ScrollViewShadowProps {
  style: StyleProp<ViewStyle>;
  inverted?: boolean;
  isAtEnd: boolean;
}

const ScrollViewShadow: React.FC<ScrollViewShadowProps> = ({
  style,
  inverted = false,
  isAtEnd,
}) => {
  const { width } = useWindowDimensions();
  const { colors } = useStyles();

  const notAtEndStyles = {
    positions: [0, 0.4, 0.75, 1],
    colors: [
      "rgba(0,0,0,0.0005)",
      "rgba(248, 248, 248,0)",
      colors.background.backgroundColor, // Match exact bottom container color
      colors.background.backgroundColor, // Match exact bottom container color
    ],
    invertedPositions: [0, 0.4],
    invertedColors: [colors.background.backgroundColor, "rgba(248, 248, 248,0)"],
  };

  const endStyles = {
    positions: [0.5, 1],
    colors: ["rgba(248, 248, 248,0)", colors.background.backgroundColor],
    invertedPositions: [0, 0.025],
    invertedColors: [colors.background.backgroundColor, "rgba(248, 248, 248,0)"],
  };

  const gradientStyles = useMemo(() => (isAtEnd ? endStyles : notAtEndStyles), [isAtEnd]);

  return (
    <Animated.View
      style={[styles.shadowContainer, inverted ? { top: 0 } : { bottom: -50 }, style]}
      pointerEvents="none"
    >
      <Canvas style={styles.shadowCanvas}>
        <Rect x={0} y={0} width={width} height={250}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 250)}
            colors={inverted ? gradientStyles.invertedColors : gradientStyles.colors}
            positions={inverted ? gradientStyles.invertedPositions : gradientStyles.positions}
          />
        </Rect>
      </Canvas>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 250, // Taller to maintain gradient quality
    zIndex: 10,
    elevation: 10,
  },
  shadowCanvas: {
    flex: 1,
  },
});

export default ScrollViewShadow;
