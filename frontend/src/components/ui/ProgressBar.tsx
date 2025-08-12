import { View, LayoutChangeEvent, Animated } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";

interface ProgressBarProps {
  value: number;
  maxValue: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ maxValue, value }) => {
  const { colors, common, layout } = useStyles();

  const [containerWidth, setContainerWidth] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  useEffect(() => {
    if (containerWidth > 0 && maxValue > 0) {
      const percentage = Math.min(value / maxValue, 1);
      const targetWidth = percentage * containerWidth;

      Animated.timing(animatedWidth, {
        toValue: targetWidth,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [containerWidth, value, maxValue]);

  return (
    <View
      onLayout={onLayout}
      style={[colors.backgroundSecondary, common.rounded, layout.widthFull]}
    >
      <Animated.View
        style={[colors.backgroundPrimary, common.rounded, { height: 10, width: animatedWidth }]}
      ></Animated.View>
    </View>
  );
};

export default ProgressBar;
