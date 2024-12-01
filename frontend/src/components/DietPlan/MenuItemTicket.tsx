import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { TouchableOpacity } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import { Text } from "../ui/Text";
import { useFoodGroupStore } from "@/store/foodgroupStore";

interface MenuItemTicketProps {
  quantity: number;
  foodGroup?: string;
  name?: string;
}

const MenuItemTicket: React.FC<MenuItemTicketProps> = ({ quantity, foodGroup, name }) => {
  const { colors, common, layout, spacing } = useStyles();
  const { setFoodGroupToDisplay } = useFoodGroupStore();

  return (
    <TouchableOpacity
      onPress={() => setFoodGroupToDisplay(foodGroup == `חלבונים` ? `protein` : `carbs`)}
      style={[
        colors.background,
        common.rounded,
        layout.flexDirectionByPlatform,
        layout.itemsCenter,
        spacing.pdSm,
        spacing.gapSm,
      ]}
    >
      <NativeIcon
        size={18}
        style={[colors.textPrimary]}
        library="MaterialCommunityIcons"
        name={foodGroup == `חלבונים` ? `fish` : `baguette`}
      />
      <Text style={[colors.textOnBackground]}>{quantity}</Text>
      <Text style={[colors.textOnBackground]}>{name || foodGroup}</Text>
    </TouchableOpacity>
  );
};

export default MenuItemTicket;
