import { IMenuItem, IServingItem } from "@/interfaces/DietPlan";
import useFontSize from "@/styles/useFontSize";
import useStyles from "@/styles/useGlobalStyles";

import React from "react";
import { View } from "react-native";
import { Text } from "../ui/Text";
import { servingTypeToString } from "@/utils/utils";

interface MenuItemProps {
  menuItem: IMenuItem;
}

const MenuItem: React.FC<MenuItemProps> = ({ menuItem }) => {
  const { md } = useFontSize();
  const { colors, layout, spacing, text, common } = useStyles();
  const servingItemKeys = Object.keys(menuItem.oneServing).filter((key) => key !== "_id");

  return (
    <View
      style={[spacing.pdXs, spacing.gapXs, common.rounded, colors.backgroundSecondaryContainer]}
    >
      <View style={[colors.borderPrimary, { borderBottomWidth: 2 }, layout.widthFull]}>
        <Text style={[colors.textOnBackground, text.textCenter, spacing.pdXs, text.textBold]}>
          {menuItem.name}
        </Text>
      </View>
      <View style={[layout.flexRow, layout.justifyAround, spacing.pdXs]}>
        {servingItemKeys.map((key, i) => {
          const typedKey = key as keyof IServingItem;
          return (
            <View key={key} style={[layout.flexRow, spacing.gapDefault]}>
              <Text style={[colors.textOnBackground, text.textRight, md]}>
                {servingTypeToString(key)}: {menuItem.oneServing[typedKey]}
              </Text>
              {i !== servingItemKeys.length - 1 && (
                <View style={[colors.borderPrimary, { borderLeftWidth: 1 }]}></View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default MenuItem;
