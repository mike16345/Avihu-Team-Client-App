import { View, LayoutChangeEvent } from "react-native";
import React, { useState, useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import useStyles from "@/styles/useGlobalStyles";

interface ProgressBarProps {
  value: number;
  maxValue: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ maxValue, value }) => {
  const { colors, common, layout } = useStyles();
  const [containerWidth, setContainerWidth] = useState(0);
  const animatedWidth = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width !== containerWidth) setContainerWidth(width);
  };

  // Animate progress change
  useEffect(() => {
    if (containerWidth > 0 && maxValue > 0) {
      const percentage = Math.min(value / maxValue, 1);
      const targetWidth = percentage * containerWidth;
      animatedWidth.value = withTiming(targetWidth, { duration: 300 });
    }
  }, [containerWidth, value, maxValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
  }));

  return (
    <View
      onLayout={onLayout}
      style={[colors.backgroundSecondary, common.rounded, layout.widthFull]}
    >
      <Animated.View
        style={[colors.backgroundPrimary, common.rounded, { height: 10 }, animatedStyle]}
      />
    </View>
  );
};

export default ProgressBar;
