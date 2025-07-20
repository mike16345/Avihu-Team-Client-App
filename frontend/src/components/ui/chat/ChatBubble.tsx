import { useWindowDimensions, View } from "react-native";
import React from "react";
import { Text } from "../Text";
import useStyles from "@/styles/useGlobalStyles";

interface ChatBubbleProps {
  variant?: "prompt" | "response";
  text: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ text, variant = "prompt" }) => {
  const { colors, common, layout, spacing, text: textStyles } = useStyles();
  const { width } = useWindowDimensions();

  const variantStyles =
    variant === "prompt"
      ? [colors.backgroundSuccessContainer, layout.alignSelfStart]
      : [colors.backgroundSurface, layout.alignSelfEnd];

  return (
    <View
      style={[
        common.rounded,
        common.borderXsm,
        colors.outline,
        spacing.pdDefault,
        variantStyles,
        { maxWidth: width * 0.75 },
      ]}
    >
      <Text style={[textStyles.textLeft, colors.textPrimary]}>{text}</Text>
    </View>
  );
};

export default ChatBubble;
