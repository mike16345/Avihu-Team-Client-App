import NativeIcon from "@/components/Icon/NativeIcon";
import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Text, View } from "react-native";

interface NoDataScreenProps {
  variant?: "dietPlan" | "workoutPlan";
  message?: string;
}

const NoDataScreen: React.FC<NoDataScreenProps> = ({ variant, message }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  return (
    <View style={[layout.flex1, layout.sizeFull, layout.center, spacing.gapDefault]}>
      <NativeIcon
        library="Ionicons"
        name="cloud-offline-outline"
        size={110}
        style={[colors.textPrimary, spacing.pdDefault]}
      />
      <Text style={[fonts.lg, colors.textOnBackground, text.textBold]}>
        {message
          ? message
          : variant == `dietPlan`
          ? `טרם בנו לך תפריט תזונה`
          : `טרם בנו לך תוכנית אימון`}
      </Text>
    </View>
  );
};

export default NoDataScreen;
