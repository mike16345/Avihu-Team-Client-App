import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

const ChatInput: React.FC<TextInputProps> = ({ style, ...props }) => {
  const { common, colors, text } = useStyles();

  return (
    <TextInput
      placeholderTextColor="#A0A0A0"
      style={[
        common.borderXsm,
        colors.outline,
        common.roundedLg,
        text.textRight,
        styles.input,
        style,
      ]}
      multiline
      selectionColor={colors.textPrimary.color}
      cursorColor={colors.textPrimary.color}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    writingDirection: "rtl",
    maxHeight: 80,
    overflow: "hidden",
  },
});

export default ChatInput;
