import { View, Text } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import NativeIcon from "@/components/Icon/NativeIcon";

interface ErrorScreenProps {
  error: any;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error }) => {
  console.log(error);

  const { colors, common, fonts, layout, spacing, text } = useStyles();
  return (
    <View style={[layout.flex1, layout.center, spacing.gapDefault]}>
      <NativeIcon
        library="MaterialIcons"
        name="error-outline"
        size={150}
        style={[colors.textDanger]}
      />
      <Text style={[colors.textOnBackground, fonts.xxl]}>אירעה שגיאה</Text>
      <Text style={[colors.textOnBackground, fonts.xl]}>{error.message}</Text>
    </View>
  );
};

export default ErrorScreen;
