import React from "react";
import {  Text, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

interface StandardMealItemProps {
  quantity: number;
  icon: JSX.Element;
}

const StandardMealItem: React.FC<StandardMealItemProps> = ({ quantity, icon }) => {
  const {colors,layout,spacing}=useStyles();

  return (
    <View style={[
      layout.flexRow,
      layout.itemsCenter,
      spacing.pdXs,
      spacing.gapXs
    ]}>
      {icon}
      <Text style={colors.textOnSecondaryContainer}>חלבונים: {quantity}</Text>
    </View>
  );
};



export default StandardMealItem;
