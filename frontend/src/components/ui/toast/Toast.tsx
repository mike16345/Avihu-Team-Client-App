import { Animated, View, Easing, Dimensions } from "react-native";
import React, { useEffect, useRef } from "react";
import { Text } from "../Text";
import { IToast } from "@/interfaces/toast";
import useStyles from "@/styles/useGlobalStyles";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const Toast: React.FC<{ toast: IToast; externalTranslateY?: Animated.Value }> = ({
  toast: { message, title, type, duration },
  externalTranslateY,
}) => {
  const { colors, common, layout, spacing, text } = useStyles();

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
      style={[
        { transform: [{ translateY: externalTranslateY || translateY }] },
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
        <Text style={[colors.textOnPrimary, text.textBold]}>{title}</Text>
      </View>

      <Text style={messageStyle}>{message}</Text>
    </Animated.View>
  );
};

export default Toast;
