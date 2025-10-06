import useBackHandler from "@/hooks/useBackHandler";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, View, Pressable, LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useAnimatedReaction,
} from "react-native-reanimated";

const { height: SCREEN_H } = Dimensions.get("window");

const PEEK = 405;
const OPEN_Y = -50;
const SNAP = 48;

type Props = {
  visible: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose: () => void;
  children: React.ReactNode;
  radius?: number;
  onLayout?: (e: LayoutChangeEvent) => void;
  /** Optional: render a custom handle (icon etc). If omitted, a default small bar is shown. */
  renderHandle?: (args: { toggle: () => void; isOpen: boolean }) => React.ReactNode;
  /** Optional: Controls how much space the bottom sheet initally takes up. */

  peek?: number;
};

export default function BottomSheetModal({
  visible,
  onOpenChange,
  onClose,
  children,
  radius = 16,
  renderHandle,
  onLayout,
  peek = PEEK,
}: Props) {
  const CLOSED_Y = SCREEN_H - peek;

  const translateY = useSharedValue(CLOSED_Y);
  const startY = useSharedValue(CLOSED_Y);
  const lastNotifiedOpen = useSharedValue<boolean>(visible);

  // Local state just for handle render & backdrop pointerEvents
  const [isOpen, setIsOpen] = useState<boolean>(visible);

  // keep local state in sync with animated open/close detection
  useAnimatedReaction(
    () => translateY.value <= OPEN_Y + SNAP,
    (nowIsOpen) => {
      if (nowIsOpen !== isOpen) runOnJS(setIsOpen)(nowIsOpen);
    },
    [isOpen]
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [OPEN_Y, CLOSED_Y], [0.4, 0], Extrapolation.CLAMP),
  }));

  const notifyOpenChange = (open: boolean) => {
    lastNotifiedOpen.value = open;
    onOpenChange(open);
  };

  const toggle = () => {
    const target = isOpen ? CLOSED_Y : OPEN_Y;
    translateY.value = withTiming(target, { duration: 350 }, (finished) => {
      if (finished) {
        if (target === CLOSED_Y) {
          runOnJS(onClose)();
          runOnJS(notifyOpenChange)(false);
        } else {
          runOnJS(notifyOpenChange)(true);
        }
      }
    });
  };

  useEffect(() => {
    translateY.value = withTiming(CLOSED_Y, { duration: 100 });
  }, [peek]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-20, 20])
        .failOffsetX([-15, 15])
        .onBegin(() => {
          startY.value = translateY.value;
        })
        .onUpdate((e) => {
          const next = Math.min(CLOSED_Y, Math.max(OPEN_Y, startY.value + e.translationY));
          translateY.value = next;

          const nearOpen = next <= OPEN_Y + SNAP;
          const nearClosed = next >= CLOSED_Y - SNAP;

          let isOpenNow = lastNotifiedOpen.value;
          if (nearOpen) isOpenNow = true;
          else if (nearClosed) isOpenNow = false;

          if (isOpenNow !== lastNotifiedOpen.value) {
            lastNotifiedOpen.value = isOpenNow;
            runOnJS(onOpenChange)(isOpenNow);
          }
        })
        .onEnd((e) => {
          const mid = (CLOSED_Y - OPEN_Y) / 2;
          const distFromTop = translateY.value - OPEN_Y;
          const goingDown = e.velocityY > 0;

          const target = goingDown
            ? distFromTop > mid
              ? CLOSED_Y
              : OPEN_Y
            : distFromTop < mid
            ? OPEN_Y
            : CLOSED_Y;

          translateY.value = withTiming(target, { duration: 200 }, (finished) => {
            if (finished && target === CLOSED_Y) {
              runOnJS(onClose)();
              runOnJS(notifyOpenChange)(false);
            } else {
              runOnJS(notifyOpenChange)(true);
            }
          });
        }),
    [onClose]
  );

  useBackHandler(() => {
    if (lastNotifiedOpen.value) {
      onClose();
      return true;
    }

    return false;
  });

  useEffect(() => {
    lastNotifiedOpen.value = visible;
    translateY.value = withTiming(visible ? OPEN_Y : CLOSED_Y, { duration: 220 }, (finished) => {
      if (finished) {
        // keep local state in sync for handle/backdrop pointer events
        runOnJS(setIsOpen)(visible);
      }
    });
  }, [visible]);

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[styles.backdrop, { borderRadius: radius }, backdropAnimatedStyle]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        onLayout={onLayout}
        style={[styles.sheet, { borderRadius: radius }, sheetStyle]}
        pointerEvents="box-none"
      >
        <GestureDetector gesture={pan}>
          <View style={styles.handleContainer} pointerEvents="auto">
            {renderHandle ? (
              renderHandle({ toggle, isOpen })
            ) : (
              <Pressable onPress={toggle} hitSlop={12} style={styles.defaultHandle}>
                <View style={styles.handleBar} />
              </Pressable>
            )}
          </View>
        </GestureDetector>

        <View style={styles.content} pointerEvents="box-none">
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: OPEN_Y, // keeps it tall enough as you had
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 18,
  },
  defaultHandle: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C8C8C8",
  },
  content: {
    flex: 1,
    minHeight: 1, // ensure layout space even with small content
  },
});
