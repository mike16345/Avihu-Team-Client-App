import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { StyleSheet, View, useWindowDimensions, Pressable, LayoutChangeEvent } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  runOnUI,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import useBackHandler from "@/hooks/useBackHandler";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type FixedRangeBottomDrawerProps = {
  /** Collapsed height in px – parent decides (e.g. X px above navbar) */
  minHeight: number;
  /** Distance from top of the screen where the drawer should stop (in px) */
  topOffset: number;
  /** Optional: get notified when drawer expands/collapses */
  onStateChange?: (isExpanded: boolean) => void;
  onLayout?: (e: LayoutChangeEvent) => void;

  renderHandle?: (args: { toggle: () => void; isOpen: boolean }) => React.ReactNode;
  children: ReactNode;
};

const FixedRangeBottomDrawer: React.FC<FixedRangeBottomDrawerProps> = ({
  minHeight,
  topOffset,
  onStateChange,
  onLayout,
  renderHandle,
  children,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const bottomBarHeight = useBottomTabBarHeight();

  const [isOpenJS, setIsOpenJS] = useState(false); // 👈 NEW

  // Maximum height the drawer can reach (fixed distance from top).
  const maxHeight = useMemo(() => {
    const bottomOffset = 30;
    const h = screenHeight - (bottomBarHeight + bottomOffset) - topOffset;

    return Math.max(h, minHeight);
  }, [screenHeight, topOffset, minHeight]);

  // Current height of the drawer.
  const height = useSharedValue(minHeight);
  const isExpanded = useSharedValue(false);
  const dragStartHeight = useSharedValue(minHeight);

  const notifyStateChange = (expanded: boolean) => {
    if (onStateChange) onStateChange(expanded);
    setIsOpenJS(expanded); // 👈 NEW
  };

  const animateTo = (targetHeight: number, expanded: boolean) => {
    "worklet";
    height.value = withTiming(targetHeight, { duration: 250 }, (finished) => {
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
    runOnUI(toggle)();
  };

  useEffect(() => {
    height.value = withTiming(minHeight, { duration: 50 });
  }, [minHeight]);

  useBackHandler(() => {
    if (isExpanded.value) {
      onHandlePress();
      return true;
    }
    return false;
  });

  return (
    <Animated.View onLayout={onLayout} style={[styles.container, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.handleContainer} pointerEvents="auto">
          {renderHandle ? (
            renderHandle({ toggle: onHandlePress, isOpen: isOpenJS })
          ) : (
            <Pressable onPress={toggle} style={styles.defaultHandle}>
              <View style={styles.handleBar} />
            </Pressable>
          )}
        </View>
      </GestureDetector>

      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 999,
    // backgroundColor intentionally neutral – you style it outside if you want
    backgroundColor: "white",
  },
  handleArea: {
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultHandle: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#E2E2E2",
  },
  handleBar: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C8C8C8",
  },
  content: {
    flex: 1,
  },
});

export default FixedRangeBottomDrawer;
