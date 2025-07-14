import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Text } from "../ui/Text";
import { View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";

interface PasswordIndicatorItemProps {
  checked: boolean;
  message: string;
}

const PasswordIndicatorItem: React.FC<PasswordIndicatorItemProps> = ({ checked, message }) => {
  const { colors, layout, spacing, fonts } = useStyles();

  return (
    <View style={[layout.flexRow, layout.justifyEnd, layout.itemsCenter, spacing.gapDefault]}>
      <Text style={colors.textOnBackground}>{message}</Text>
      <NativeIcon
        library="Feather"
        name="check"
        style={[
          checked ? colors.textSuccess : colors.textOnBackground,
          fonts.xl,
          { opacity: checked ? 1 : 0.6 },
        ]}
      />
    </View>
  );
};

export default PasswordIndicatorItem;
