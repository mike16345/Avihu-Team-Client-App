import { FC } from "react";
import { Text as RNText, TextProps } from "react-native";

export const Text: FC<TextProps> = ({ style, ...props }) => {
  return <RNText style={[{ fontFamily: "Assistant" }, style]} {...props} />;
};
