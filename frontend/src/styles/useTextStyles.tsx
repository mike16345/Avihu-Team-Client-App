import { useThemeContext } from "@/themes/useAppTheme";
import { I18nManager, StyleSheet } from "react-native";
import { getTextStartAlignment } from "./textDirection";

const useTextStyles = () => {
  const { theme } = useThemeContext();

  const textStyles = StyleSheet.create({
    textStart: {
      textAlign: getTextStartAlignment(I18nManager.isRTL, I18nManager.doLeftAndRightSwapInRTL),
    },
    textRight: {
      textAlign: "right",
    },
    textLeft: {
      textAlign: "left",
    },
    textCenter: {
      textAlign: "center",
    },
    textBold: {
      fontWeight: "bold",
    },
    textItalic: {
      fontStyle: "italic",
    },
    textUnderline: {
      textDecorationLine: "underline",
    },
    textUppercase: {
      textTransform: "uppercase",
    },
    textLowercase: {
      textTransform: "lowercase",
    },
    textCapitalize: {
      textTransform: "capitalize",
    },
    textPrimary: {
      color: theme.colors.primary,
    },
    textSecondary: {
      color: theme.colors.secondary,
    },
    textDanger: {
      color: theme.colors.error,
    },
    textInfo: {
      color: theme.colors.info,
    },
  });

  return textStyles;
};

export default useTextStyles;
