import { IMeal } from "@/interfaces/DietPlan";
import React from "react";
import { View } from "react-native";
import CustomInstructionsContainer from "./CustomInstructionsContainer";
import StandardMealItem from "./StandardMealItem";
import NativeIcon from "../Icon/NativeIcon";
import useStyles from "@/styles/useGlobalStyles";
import { useThemeContext } from "@/themes/useAppTheme";

interface MealContainerProps {
  meal: IMeal;
}

const MealContainer: React.FC<MealContainerProps> = ({ meal }) => {

  const {layout, spacing,}=useStyles()
  const {theme}=useThemeContext()

  const mealItems=Object.values(meal)
  
  return (
    <View style={[
      layout.rtl,
      layout.flexRow,
      layout.justifyStart,
      layout.wrap,
      spacing.gapDefault,
      spacing.pdDefault,
      {
        width:`80%`
      },

    ]}>
      {mealItems.map(mealItem => 
  mealItem.customInstructions && mealItem.customInstructions[0] ? (
    <CustomInstructionsContainer
      key={mealItem._id} 
      customInstructions={mealItem.customInstructions}
      icon={
        <NativeIcon 
          library="MaterialCommunityIcons" 
          name="fish" 
          size={20} 
          color={theme.colors.primary} 
        />
      }
      foodGroup='חלבונים'
    />
  ) : mealItem.quantity > 0 ? (
    <StandardMealItem 
      key={mealItem._id} 
      icon={
        <NativeIcon
          library="MaterialCommunityIcons"
          name="fish"
          size={20}
          color={theme.colors.primary}
        />
      } 
      quantity={mealItem.quantity} 
    />
  ) 
  : null
)}
    </View>
  );
};



export default MealContainer;
