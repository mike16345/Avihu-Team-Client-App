import { IMenuItem } from "@/interfaces/DietPlan";
import useFontSize from "@/styles/useFontSize";
import useStyles from "@/styles/useGlobalStyles";

import React from "react";
import { View } from "react-native";
import { Text } from "../ui/Text";

interface MenuItemProps {
  menuItem: IMenuItem;
}

const MenuItem: React.FC<MenuItemProps> = ({ menuItem }) => {
  const { md } = useFontSize();
  const { colors, layout, spacing, text, common } = useStyles();

  return (
    <View
      style={[spacing.pdXs, spacing.gapXs, common.rounded, colors.backgroundSecondaryContainer]}
    >
      <View style={[colors.borderPrimary, { borderBottomWidth: 2 }, layout.widthFull]}>
        <Text style={[colors.textOnBackground, text.textRight, spacing.pdXs, text.textBold]}>
          {menuItem.name}
        </Text>
      </View>
      <View style={[layout.flexRow, layout.justifyBetween, spacing.gapSm, spacing.pdXs]}>
        <Text style={[colors.textOnBackground, md]}>גרם: {menuItem.oneServing.grams}</Text>
        <View style={[colors.borderPrimary, { borderLeftWidth: 1 }]}></View>
        <Text style={[colors.textOnBackground, md]}>כפות: {menuItem.oneServing.spoons}</Text>
      </View>
    </View>
  );
};

export default MenuItem;
