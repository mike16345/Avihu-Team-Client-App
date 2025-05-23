import { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, View, StyleSheet } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "./ConditionalRender";
import ExpandedTimer from "../timer/ExpandedTimer";
import ShrunkenTimer from "../timer/ShrunkenTimer";

const MIN_HEIGHT = 90;
const MAX_HEIGHT = 170;

const TimerDrawer = () => {
  const { colors, common } = useStyles();

  const [isExpanded, setIsExpanded] = useState(false);

  const isExpandedRef = useRef(isExpanded);

  // Sync ref whenever state changes
  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  const animatedHeight = useRef(new Animated.Value(MIN_HEIGHT)).current;
  const lastHeight = useRef(MIN_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newHeight = lastHeight.current + gestureState.dy;

        if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
          animatedHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const newHeight = lastHeight.current + gestureState.dy;
        const shouldExpand = newHeight > (MIN_HEIGHT + MAX_HEIGHT) / 2;

        setIsExpanded(shouldExpand);

        const finalHeight = shouldExpand ? MAX_HEIGHT : MIN_HEIGHT;
        lastHeight.current = finalHeight;

        Animated.spring(animatedHeight, {
          toValue: finalHeight,
          useNativeDriver: false,
        }).start();

        if (shouldExpand !== isExpandedRef.current) {
          setIsExpanded(shouldExpand);
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.drawer,
        {
          height: animatedHeight,
        },
        colors.background,
        common.borderDefault,
        colors.borderSecondaryContainer,
        { borderTopWidth: 0 },
        common.rounded,
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.dragHandle} />

      <ConditionalRender condition={!isExpanded} children={<ShrunkenTimer />} />

      <ConditionalRender condition={isExpanded} children={<ExpandedTimer />} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    overflow: "hidden",
  },
  dragHandle: {
    position: "absolute",
    bottom: 0,
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginVertical: 10,
  },
});

export default TimerDrawer;
