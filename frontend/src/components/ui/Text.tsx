import { FC } from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";

type FontVariant =
  | "extraLight"
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";

const FONT_MAP: Record<FontVariant, string> = {
  extraLight: "Assistant-ExtraLight",
  light: "Assistant-Light",
  regular: "Assistant-Regular",
  medium: "Assistant-Medium",
  semibold: "Assistant-SemiBold",
  bold: "Assistant-Bold",
  extrabold: "Assistant-ExtraBold",
};

interface TextProps extends RNTextProps {
  fontVariant?: FontVariant;
}

export const Text: FC<TextProps> = ({ fontVariant = "regular", style, ...props }) => {
  return (
    <RNText style={[{ fontFamily: FONT_MAP[fontVariant], fontWeight: 600 }, style]} {...props} />
  );
};
