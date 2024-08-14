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

  const { totalCarbs, totalProtein, totalFats, totalVeggies } = meal;
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
      {totalProtein.customInstructions && totalProtein.customInstructions[0] ? (
        <CustomInstructionsContainer
          customInstructions={totalProtein.customInstructions}
          icon={
            <NativeIcon 
              library="MaterialCommunityIcons" 
              name='fish' 
              size={20} 
              color={theme.colors.primary} 
            />
          }
          foodGroup="חלבונים"
        />
      ) : (
        totalProtein &&
        totalProtein.quantity > 0 && (
          <StandardMealItem 
            icon={
                <NativeIcon
                  library="MaterialCommunityIcons"
                  name='fish'
                  size={20}
                  color={theme.colors.primary}
                />
              } 
            quantity={totalProtein.quantity} />
        )
      )}

      {totalCarbs.customInstructions && totalCarbs.customInstructions[0] ? (
        <CustomInstructionsContainer
          customInstructions={totalCarbs.customInstructions}
          icon={
            <NativeIcon 
              library="MaterialCommunityIcons" 
              name='baguette' 
              size={20} 
              color={theme.colors.primary} 
            />
          }
          foodGroup="פחמימות"
        />
      ) : (
        totalCarbs.quantity > 0 && (
          <StandardMealItem 
            icon={
               <NativeIcon
                  library="MaterialCommunityIcons"
                  name='baguette'
                  size={20}
                  color={theme.colors.primary}
                />
            }
            quantity={totalCarbs.quantity} 
          />
        )
      )}
      {totalFats && totalFats.quantity > 0 && (
        <StandardMealItem 
          icon={
             <NativeIcon
                  library="MaterialCommunityIcons"
                  name='cheese'
                  size={20}
                  color={theme.colors.primary}
                />
          }
          quantity={totalFats.quantity} 
        />
      )}
      {totalVeggies && totalVeggies?.quantity > 0 && (
        <StandardMealItem 
          icon={
             <NativeIcon
                  library="MaterialCommunityIcons"
                  name='leaf'
                  size={20}
                  color={theme.colors.primary}
                />
          }
          quantity={totalVeggies.quantity} 
        />
      )}
    </View>
  );
};



export default MealContainer;
