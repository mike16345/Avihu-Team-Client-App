import { Animated, useWindowDimensions } from "react-native";
import React, { ReactNode, useEffect, useRef } from "react";
import { Text } from "../Text";
import useStyles from "@/styles/useGlobalStyles";

interface ChatBubbleProps {
  variant?: "prompt" | "response";
  children: ReactNode;
  language?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ children, variant = "prompt", language }) => {
  const { colors, common, layout, spacing } = useStyles();
  const { width } = useWindowDimensions();

  const variantStyles =
    variant === "prompt"
      ? [colors.backgroundSuccessContainer, layout.alignSelfStart]
      : [colors.backgroundSurface, layout.alignSelfEnd];

  const isRTL = (language ?? "he").toLowerCase().startsWith("he");
  const writingDirection = isRTL ? "rtl" : "ltr";

  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        common.rounded,
        common.borderXsm,
        colors.outline,
        spacing.pdDefault,
        variantStyles,
        { maxWidth: width * 0.75, transform: [{ translateY }] },
      ]}
    >
      <Text
        fontVariant={variant == "prompt" ? "light" : "regular"}
        fontSize={16}
        style={[colors.textPrimary, { lineHeight: 20, writingDirection }]}
      >
        {children}
      </Text>
    </Animated.View>
  );
};

export default ChatBubble;
