import { useThemeContext } from "@/themes/useAppTheme";
import { StyleSheet } from "react-native";

const useTextStyles = () => {
  const { theme } = useThemeContext();

  const textStyles = StyleSheet.create({
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
