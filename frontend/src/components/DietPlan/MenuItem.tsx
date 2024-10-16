import { IMenuItem } from "@/interfaces/DietPlan";
import useFontSize from "@/styles/useFontSize";
import useStyles from "@/styles/useGlobalStyles";

import React from "react";
import { Text, View } from "react-native";

interface MenuItemProps {
  menuItem: IMenuItem;
}

const MenuItem: React.FC<MenuItemProps> = ({ menuItem }) => {
  const { md } = useFontSize();
  const { colors, layout, spacing, text } = useStyles();

  return (
    <View style={[layout.itemsCenter, spacing.pdXs, spacing.gapXs]}>
      <View style={[colors.borderPrimary, { borderBottomWidth: 2 }, layout.widthFull]}>
        <Text style={[colors.textOnSecondaryContainer, text.textRight, spacing.pdXs]}>
          {menuItem.name}
        </Text>
      </View>
      <View style={[layout.flexRow, layout.justifyBetween, spacing.gapSm, spacing.pdXs]}>
        <Text style={[colors.textOnSecondaryContainer, md]}>גרם: {menuItem.oneServing.grams}</Text>
        <View style={[colors.borderPrimary, { borderLeftWidth: 1 }]}></View>
        <Text style={[colors.textOnSecondaryContainer, md]}>
          כפות: {menuItem.oneServing.spoons}
        </Text>
      </View>
    </View>
  );
};

export default MenuItem;
