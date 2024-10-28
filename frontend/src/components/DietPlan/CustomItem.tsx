import React from "react";
import { Text, View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import useStyles from "@/styles/useGlobalStyles";

interface CustomItemProps {
  name: string;
  quantity: number;
  foodGroup: string;
}

const CustomItem: React.FC<CustomItemProps> = ({ name, quantity, foodGroup }) => {
  const { layout, spacing, colors, text, common } = useStyles();

  return (
    <View
      style={[
        layout.itemsCenter,
        layout.flexRow,
        colors.backgroundSecondary,
        common.rounded,
        spacing.pdSm,
        layout.wrap,
        spacing.gapDefault,
        layout.widthFull,
      ]}
    >
      <View style={[colors.background, common.roundedSm]}>
        <NativeIcon
          size={25}
          style={[colors.textPrimary]}
          library="MaterialCommunityIcons"
          name={foodGroup == `חלבונים` ? `fish` : `baguette`}
        />
      </View>
      <View
        style={[layout.flexRow, layout.center, spacing.gapDefault, spacing.pdDefault, layout.wrap]}
      >
        <Text style={[colors.textOnSecondary, text.textBold]}>{name}</Text>
        <View style={[colors.backgroundPrimary, { width: 3, height: 14 }]}></View>
        <Text style={[colors.textOnSecondary]}>
          {quantity > 1 ? `${quantity} מנות` : `מנה אחת`}
        </Text>
      </View>
    </View>
  );
};

export default CustomItem;
