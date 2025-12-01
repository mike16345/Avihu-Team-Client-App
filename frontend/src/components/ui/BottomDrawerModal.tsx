import React, { ReactNode, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions, Pressable } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type FixedRangeBottomDrawerProps = {
  /** Collapsed height in px – parent decides (e.g. X px above navbar) */
  minHeight: number;
  /** Distance from top of the screen where the drawer should stop (in px) */
  topOffset: number;
  /** Optional: get notified when drawer expands/collapses */
  onStateChange?: (isExpanded: boolean) => void;
  children: ReactNode;
};

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 220,
  mass: 0.9,
};

const FixedRangeBottomDrawer: React.FC<FixedRangeBottomDrawerProps> = ({
  minHeight,
  topOffset,
  onStateChange,
  children,
}) => {
  const { height: screenHeight } = useWindowDimensions();

  // Maximum height the drawer can reach (fixed distance from top).
  const maxHeight = useMemo(() => {
    const h = screenHeight - topOffset;
    // Safety: never smaller than minHeight
    return Math.max(h, minHeight);
  }, [screenHeight, topOffset, minHeight]);

  // Current height of the drawer.
  const height = useSharedValue(minHeight);
  const isExpanded = useSharedValue(false);
  const dragStartHeight = useSharedValue(minHeight);

  const notifyStateChange = (expanded: boolean) => {
    if (onStateChange) onStateChange(expanded);
  };

  const animateTo = (targetHeight: number, expanded: boolean) => {
    "worklet";
    height.value = withSpring(targetHeight, SPRING_CONFIG, (finished) => {
      if (finished) {
        isExpanded.value = expanded;
        if (onStateChange) {
          runOnJS(notifyStateChange)(expanded);
        }
      }
    });
  };

  const toggle = () => {
    "worklet";
    const target = isExpanded.value ? minHeight : maxHeight;
    const nextExpanded = !isExpanded.value;
    animateTo(target, nextExpanded);
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      dragStartHeight.value = height.value;
    })
    .onUpdate((event) => {
      const newHeight = dragStartHeight.value - event.translationY; // drag up => bigger height
      const clamped = Math.min(Math.max(newHeight, minHeight), maxHeight);
      height.value = clamped;
    })
    .onEnd((event) => {
      // Decide if we snap open or closed.
      const midpoint = (minHeight + maxHeight) / 2;
      const goingUpFast = event.velocityY < -600;
      const goingDownFast = event.velocityY > 600;

      let expand: boolean;
      if (goingUpFast) expand = true;
      else if (goingDownFast) expand = false;
      else expand = height.value > midpoint;

      const target = expand ? maxHeight : minHeight;
      animateTo(target, expand);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const onHandlePress = () => {
    // Call worklet toggle from JS
    toggle(); // Reanimated v3 can call worklets directly from JS
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Handle */}
        <Pressable onPress={onHandlePress} style={styles.handleArea}>
          <View style={styles.handleBar} />
        </Pressable>

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    // backgroundColor intentionally neutral – you style it outside if you want
    backgroundColor: "white",
  },
  handleArea: {
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#CCCCCC",
  },
  content: {
    flex: 1,
  },
});

export default FixedRangeBottomDrawer;
