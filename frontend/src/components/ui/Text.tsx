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

export interface TextProps extends RNTextProps {
  fontVariant?: FontVariant;
  fontSize?: number;
}

export const Text: FC<TextProps> = ({ fontVariant = "regular", fontSize, style, ...props }) => {
  return (
    <RNText
      style={[
        { fontFamily: FONT_MAP[fontVariant], fontSize: fontSize, writingDirection: "rtl" },
        style,
      ]}
      {...props}
    />
  );
};
