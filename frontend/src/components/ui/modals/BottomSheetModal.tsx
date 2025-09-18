import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View, Pressable, BackHandler } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_H } = Dimensions.get("window");

// How tall the “peek” is when collapsed (only the header/arrow visible)
const PEEK = 430;
// Closed position is off-screen except the peek
const CLOSED_Y = SCREEN_H - PEEK;
// Open is fully expanded to the top
const OPEN_Y = -60;
const SNAP = 48; // px tolerance near OPEN/CLOSED

type Props = {
  /** control from parent */
  visible: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose: () => void;
  /** content inside the sheet */
  children: React.ReactNode;
  /** optional corner radius for the sheet top */
  radius?: number;
};

export default function BottomSheetModal({
  visible,
  onOpenChange,
  onClose,
  children,
  radius = 16,
}: Props) {
  const translateY = useSharedValue(CLOSED_Y);
  const startY = useSharedValue(CLOSED_Y);
  const lastNotifiedOpen = useSharedValue<boolean>(visible);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [OPEN_Y, CLOSED_Y], [0.4, 0], Extrapolation.CLAMP),
    pointerEvents: translateY.value < CLOSED_Y ? "auto" : "none",
  })) as any;

  const pan = Gesture.Pan()
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
        } else {
          runOnJS(onOpenChange)(true);
        }
      });
    });

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (lastNotifiedOpen.value) {
        onClose();
        return true;
      }

      return false;
    });

    return () => {
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    lastNotifiedOpen.value = visible;

    translateY.value = withTiming(visible ? OPEN_Y : CLOSED_Y, { duration: 220 });
  }, [visible]);

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.sheet,
            { borderTopLeftRadius: radius, borderTopRightRadius: radius },
            sheetStyle,
          ]}
        >
          <View style={{ flex: 1, height: SCREEN_H }}>{children}</View>
        </Animated.View>
      </GestureDetector>
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
    bottom: OPEN_Y,
    backgroundColor: "white",
    transform: [{ translateY: CLOSED_Y }],
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
});
