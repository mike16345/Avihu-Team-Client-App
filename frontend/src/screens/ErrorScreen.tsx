import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import NativeIcon from "@/components/Icon/NativeIcon";
import { Text } from "@/components/ui/Text";
import { Button } from "react-native-paper";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
interface ErrorScreenProps {
  error?: any;
  refetchFunc?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, refetchFunc }) => {
  const { colors, fonts, layout, spacing, common } = useStyles();

  return (
    <View style={[layout.flex1, layout.center, spacing.gapDefault]}>
      <NativeIcon
        library="MaterialIcons"
        name="error-outline"
        size={150}
        style={[colors.textDanger]}
      />
      <Text style={[colors.textOnBackground, fonts.xl]}>אירעה שגיאה</Text>
      <ConditionalRender
        condition={error}
        children={<Text style={[colors.textOnBackground, fonts.xl]}>{error?.message || ""}</Text>}
      />
      {refetchFunc && (
        <Button
          mode="contained"
          onPress={refetchFunc}
          icon={() => (
            <NativeIcon library="AntDesign" name="reload1" style={colors.textOnBackground} />
          )}
          style={[common.rounded, spacing.mgVerticalDefault]}
          textColor={colors.textOnBackground.color}
        >
          רענן
        </Button>
      )}
    </View>
  );
};

export default ErrorScreen;
