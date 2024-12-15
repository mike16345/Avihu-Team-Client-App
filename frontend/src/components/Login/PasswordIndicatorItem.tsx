import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Checkbox } from "react-native-paper";

import { Text } from "../ui/Text";
import { View } from "react-native";

interface PasswordIndicatorItemProps {
  checked: boolean;
  message: string;
}

const PasswordIndicatorItem: React.FC<PasswordIndicatorItemProps> = ({ checked, message }) => {
  const { colors, layout, spacing } = useStyles();
  return (
    <View
      style={[
        layout.flexDirectionByPlatform,
        layout.justifyEnd,
        layout.itemsCenter,
        spacing.gapDefault,
        checked ? colors.borderSuccess : colors.borderError,
        { borderBottomWidth: 2 },
      ]}
    >
      <Text style={colors.textOnBackground}>{message}</Text>
      <Checkbox status={"checked"} color={colors.textSuccess.color} disabled={!checked} />
    </View>
  );
};

export default PasswordIndicatorItem;
