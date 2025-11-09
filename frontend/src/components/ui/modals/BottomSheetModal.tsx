import { BOTTOM_BAR_HEIGHT, TOP_BAR_HEIGHT } from "@/constants/Constants";
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
const SNAP = 48;

type Props = {
  visible: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose: () => void;
  children: React.ReactNode;
  radius?: number;
  onLayout?: (e: LayoutChangeEvent) => void;
  renderHandle?: (args: { toggle: () => void; isOpen: boolean }) => React.ReactNode;
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
  // Calculate heights based on available screen space
  const MIN_HEIGHT = peek - 210; // Closed state
  const MAX_HEIGHT = SCREEN_H - BOTTOM_BAR_HEIGHT - TOP_BAR_HEIGHT * 3.5; // Fully open, leaving 60px from top
  const HEIGHT_RANGE = MAX_HEIGHT - MIN_HEIGHT;
  const EDGE_SNAP_PX = Math.max(12, HEIGHT_RANGE * 0.12);
  const FLICK_VELOCITY = 600;

  const sheetHeight = useSharedValue(MIN_HEIGHT);
  const startHeight = useSharedValue(MIN_HEIGHT);
  const lastNotifiedOpen = useSharedValue<boolean>(visible);

  const [isOpen, setIsOpen] = useState<boolean>(visible);

  const sheetStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      sheetHeight.value,
      [MIN_HEIGHT, MAX_HEIGHT],
      [0, 0.4],
      Extrapolation.CLAMP
    ),
  }));

  const notifyOpenChange = (open: boolean) => {
    lastNotifiedOpen.value = open;
    onOpenChange(open);
  };

  const toggle = () => {
    const target = isOpen ? MIN_HEIGHT : MAX_HEIGHT;

    sheetHeight.value = withTiming(target, { duration: 350 }, (finished) => {
      if (!finished) return;

      if (target === MIN_HEIGHT) {
        runOnJS(onClose)();
        runOnJS(notifyOpenChange)(false);
      } else {
        runOnJS(notifyOpenChange)(true);
      }
    });
  };

  useAnimatedReaction(
    () => sheetHeight.value >= MAX_HEIGHT - SNAP,
    (nowIsOpen) => {
      if (nowIsOpen !== isOpen) runOnJS(setIsOpen)(nowIsOpen);
    },
    [isOpen]
  );

  useEffect(() => {
    const newMinHeight = peek;
    sheetHeight.value = withTiming(newMinHeight, { duration: 100 });
  }, [peek]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-20, 20])
        .failOffsetX([-15, 15])
        .onBegin(() => {
          startHeight.value = sheetHeight.value;
        })
        .onUpdate((e) => {
          // Dragging down = negative delta in height, dragging up = positive delta
          const next = Math.min(
            MAX_HEIGHT,
            Math.max(MIN_HEIGHT, startHeight.value - e.translationY)
          );
          sheetHeight.value = next;

          const nearOpen = next >= MAX_HEIGHT - EDGE_SNAP_PX;
          const nearClosed = next <= MIN_HEIGHT + EDGE_SNAP_PX;

          let isOpenNow = lastNotifiedOpen.value;
          if (nearOpen) isOpenNow = true;
          else if (nearClosed) isOpenNow = false;

          if (isOpenNow !== lastNotifiedOpen.value) {
            lastNotifiedOpen.value = isOpenNow;
            runOnJS(onOpenChange)(isOpenNow);
          }
        })
        .onEnd((e) => {
          const MID = (MIN_HEIGHT + MAX_HEIGHT) / 1.5;

          const delta = sheetHeight.value - startHeight.value;
          const goingUp = delta > 0;
          const isFlick = Math.abs(e.velocityY) >= FLICK_VELOCITY;

          let target: number;

          if (isFlick) {
            target = e.velocityY < 0 ? MAX_HEIGHT : MIN_HEIGHT;
          } else {
            const startedOpen = startHeight.value >= MID;
            const crossedUp = goingUp && sheetHeight.value >= MID;
            const crossedDown = !goingUp && sheetHeight.value <= MID;

            if (crossedUp) target = MAX_HEIGHT;
            else if (crossedDown) target = MIN_HEIGHT;
            else target = startedOpen ? MAX_HEIGHT : MIN_HEIGHT;
          }

          sheetHeight.value = withTiming(target, { duration: 200 }, (finished) => {
            if (finished && target === MIN_HEIGHT) {
              runOnJS(onClose)();
              runOnJS(notifyOpenChange)(false);
            } else {
              runOnJS(notifyOpenChange)(true);
            }
          });
        }),
    [onClose, MIN_HEIGHT, MAX_HEIGHT]
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
    const targetHeight = visible ? MAX_HEIGHT : MIN_HEIGHT;
    sheetHeight.value = withTiming(targetHeight, { duration: 220 }, (finished) => {
      if (finished) {
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
    bottom: BOTTOM_BAR_HEIGHT - 10,
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
    bottom: 0,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#E2E2E2",
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
    minHeight: 1,
  },
});
