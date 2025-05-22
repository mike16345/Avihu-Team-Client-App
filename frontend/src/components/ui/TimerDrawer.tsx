import React, { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, View, TouchableOpacity, StyleSheet } from "react-native";
import CircularPrgress from "./CircularPrgress";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "./Text";
import NativeIcon from "../Icon/NativeIcon";
import { formatTime } from "@/utils/timer";
import { useTimerStore } from "@/store/timerStore";
import { ConditionalRender } from "./ConditionalRender";

const MIN_HEIGHT = 90;
const MAX_HEIGHT = 170;

const TimerDrawer = () => {
  const { countdown, initialCountdown, stopCountdown } = useTimerStore();
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const [isExpanded, setIsExpanded] = useState(true);
  // Ref to hold latest value for pan responder access
  const isExpandedRef = useRef(isExpanded);

  // Sync ref whenever state changes
  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  const animatedHeight = useRef(new Animated.Value(MAX_HEIGHT)).current;
  const lastHeight = useRef(MAX_HEIGHT);

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

      <ConditionalRender
        condition={!isExpanded}
        children={
          <View
            style={[
              layout.widthFull,
              layout.heightFull,
              spacing.pdDefault,
              spacing.pdHorizontalXl,
              layout.flexRow,
              layout.itemsEnd,
              layout.justifyBetween,
            ]}
          >
            <TouchableOpacity onPress={stopCountdown}>
              <Text
                style={[colors.textOnBackground, text.textUnderline, text.textBold, fonts.default]}
              >
                דלג
              </Text>
            </TouchableOpacity>
            <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
              <NativeIcon
                library="AntDesign"
                name="clockcircleo"
                color={colors.textPrimary.color}
                size={fonts.lg.fontSize}
              />
              <Text style={[colors.textPrimary, text.textBold, fonts.xl]}>
                {formatTime(countdown || 0)}
              </Text>
            </View>
          </View>
        }
      />

      <ConditionalRender
        condition={isExpanded}
        children={
          <View
            style={[
              layout.widthFull,
              layout.flexRow,
              layout.justifyBetween,
              layout.itemsCenter,
              spacing.pdXl,
              spacing.pdVerticalXxl,
            ]}
          >
            <View style={[layout.itemsEnd, spacing.gapDefault]}>
              <Text style={[colors.textOnBackground, text.textCenter, text.textBold]}>
                זמן מנוחה עד לסט הבא
              </Text>
              <View style={[layout.flexRow, layout.itemsCenter, spacing.gapXxl]}>
                <TouchableOpacity onPress={stopCountdown}>
                  <Text
                    style={[colors.textOnBackground, text.textUnderline, text.textBold, fonts.lg]}
                  >
                    דלג
                  </Text>
                </TouchableOpacity>
                <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
                  <NativeIcon
                    color={colors.textOnBackground.color}
                    library="AntDesign"
                    name="clockcircleo"
                    style={[text.textBold, fonts.default]}
                  />
                  <Text style={[colors.textOnBackground, text.textBold, fonts.default]}>
                    {formatTime(initialCountdown)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[common.roundedFull, colors.background, spacing.pdXs]}>
              <CircularPrgress
                type="full"
                value={countdown || 0}
                size={90}
                width={10}
                maxValue={initialCountdown}
                color={colors.textPrimary.color}
                secondaryColor={colors.backdrop.backgroundColor}
                isTimer
                labelSize={fonts.lg.fontSize}
                prefil="from-start"
              />
            </View>
          </View>
        }
      />
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
