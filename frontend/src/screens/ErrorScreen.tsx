import { View, Text } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import NativeIcon from "@/components/Icon/NativeIcon";

interface ErrorScreenProps {
  error: any;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error }) => {
  const { colors, fonts, layout, spacing } = useStyles();

  return (
    <View style={[layout.flex1, layout.center, spacing.gapDefault]}>
      <NativeIcon
        library="MaterialIcons"
        name="error-outline"
        size={150}
        style={[colors.textDanger]}
      />
      <Text style={[colors.textOnBackground, fonts.xl]}>אירעה שגיאה</Text>
      <Text style={[colors.textOnBackground, fonts.xl]}>{error.message}</Text>
    </View>
  );
};

export default ErrorScreen;
