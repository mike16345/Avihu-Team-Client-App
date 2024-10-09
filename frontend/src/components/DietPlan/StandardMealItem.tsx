import React from "react";
import { Text, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

interface StandardMealItemProps {
  quantity: number;
  icon: JSX.Element;
  foodGroup?: string;
}

const StandardMealItem: React.FC<StandardMealItemProps> = ({ quantity, icon, foodGroup }) => {
  const { colors, layout, spacing } = useStyles();

  return (
    <View style={[layout.itemsEnd]}>
      <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
        <Text style={colors.textOnSecondaryContainer}>
          {foodGroup}: {quantity}
        </Text>
        {icon}
      </View>
    </View>
  );
};

export default StandardMealItem;
