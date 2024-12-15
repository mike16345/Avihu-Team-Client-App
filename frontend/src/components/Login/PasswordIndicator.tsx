import useStyles from "@/styles/useGlobalStyles";
import PasswordIndicatorItem from "./PasswordIndicatorItem";
import { View } from "react-native";
import { Text } from "../ui/Text";
import { useEffect } from "react";

interface PasswordIndicatorProps {
  password: string;
}

const PasswordIndicator: React.FC<PasswordIndicatorProps> = ({ password }) => {
  const { colors, layout, spacing, text } = useStyles();

  const DIGIT_REGEX = /\d/;
  const SPECIAL_CHAR_REGEX = /[!@#$%]/;
  const UPPERCASE_REGEX = /[A-Z]/;

  return (
    <View style={[layout.widthFull, spacing.gapSm, spacing.pdVerticalSm, spacing.pdHorizontalXs]}>
      <Text style={[text.textRight, colors.textOnBackground, text.textBold]}>
        סיסמה צריכה לכלול:
      </Text>
      <PasswordIndicatorItem
        checked={!!UPPERCASE_REGEX.test(password)}
        message="לפחות תו אחד גדול באנגלית"
      />
      <PasswordIndicatorItem checked={!!DIGIT_REGEX.test(password)} message="לפחות מספר אחד" />
      <PasswordIndicatorItem
        checked={!!SPECIAL_CHAR_REGEX.test(password)}
        message="לפחות אחד מהסימנים הבאים: ! @ # $ %"
      />
    </View>
  );
};

export default PasswordIndicator;
