import { Animated, View, Easing, Dimensions, PanResponder } from "react-native";
import React, { useEffect, useRef } from "react";
import { Text } from "../Text";
import { IToast } from "@/interfaces/toast";
import useStyles from "@/styles/useGlobalStyles";

const SCREEN_HEIGHT = Dimensions.get("window").height;
interface ToastProps {
  toast: IToast;
  externalTranslateY?: Animated.Value;
  onDismissToast: () => void;
}

const Toast: React.FC<ToastProps> = ({
  toast: { message, title, type, duration },
  externalTranslateY,
  onDismissToast,
}) => {
  const { colors, common, layout, spacing } = useStyles();

  const stylesByType = {
    success: {
      container: [colors.backgroundSuccessContainer, colors.borderSuccess],
      title: [colors.backgroundSuccess],
      message: colors.textSuccess,
    },
    error: {
      container: [colors.backgroundErrorContainer, colors.borderError],
      title: [colors.backgroundError],
      message: colors.textDanger,
    },
  };

  const { container, title: titleContainer, message: messageStyle } = stylesByType[type];

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 20) {
          onDismissToast();
          Animated.timing(pan, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }).start();
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (externalTranslateY) return;
    // Slide in
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Slide out after toast.duration or default 4000ms
    const timeout = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 500,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, duration || 4000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        {
          transform: [{ translateY: Animated.add(externalTranslateY || translateY, pan) }],
          zIndex: 100,
        },
        common.borderXsm,
        common.roundedFull,
        spacing.pdXs,
        layout.flexRow,
        spacing.gapDefault,
        layout.itemsCenter,
        layout.alignSelfCenter,
        spacing.pdHorizontalSm,
        container,
      ]}
    >
      <View style={[common.roundedFull, spacing.pdHorizontalSm, layout.center, titleContainer]}>
        <Text fontSize={12} fontVariant="bold" style={[colors.textOnPrimary]}>
          {title}
        </Text>
      </View>

      <Text fontSize={12} style={messageStyle}>
        {message}
      </Text>
    </Animated.View>
  );
};

export default Toast;
