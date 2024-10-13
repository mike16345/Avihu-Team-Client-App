import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Text, View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";

interface MenuItemTicketProps {
  quantity: number;
  foodGroup?: string;
  name?: string;
}

const MenuItemTicket: React.FC<MenuItemTicketProps> = ({ quantity, foodGroup, name }) => {
  const { colors, common, layout, spacing } = useStyles();

  return (
    <View
      style={[
        colors.background,
        common.rounded,
        layout.flexRow,
        layout.itemsCenter,
        spacing.pdSm,
        spacing.gapSm,
      ]}
    >
      <NativeIcon
        size={15}
        style={[colors.textPrimary]}
        library="MaterialCommunityIcons"
        name={foodGroup == `חלבונים` ? `fish` : `baguette`}
      />
      <Text style={[colors.textOnBackground]}>{quantity}</Text>
      <Text style={[colors.textOnBackground]}>{name || foodGroup}</Text>
    </View>
  );
};

export default MenuItemTicket;
