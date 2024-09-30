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
  const { layout, spacing } = useStyles();
  const { theme } = useThemeContext();

  const mealItems = Object.entries(meal);

  const getIcon = (key: string) => {
    switch (key) {
      case `totalProtein`:
        return `fish`;

      case `totalCarbs`:
        return `baguette`;

      case `totalFats`:
        return `cheese`;

      case `totalVeggies`:
        return `leaf`;

      default:
        return `food-takeout-box-outline`;
    }
  };
  const getName = (key: string) => {
    switch (key) {
      case `totalProtein`:
        return `חלבונים`;

      case `totalCarbs`:
        return `פחמימות`;

      case `totalFats`:
        return `שומנים`;

      case `totalVeggies`:
        return `ירקות`;
    }
  };

  return (
    <View style={[layout.rtl, layout.wrap, spacing.gapDefault, spacing.pdDefault]}>
      {mealItems.map((mealItem) => (
        <React.Fragment key={mealItem[1]._id}>
          {mealItem[1].customItems && mealItem[1].customItems.length > 0 && (
            <CustomInstructionsContainer
              customInstructions={mealItem[1].customInstructions}
              icon={
                <NativeIcon
                  library="MaterialCommunityIcons"
                  name={getIcon(mealItem[0])}
                  size={20}
                  color={theme.colors.primary}
                />
              }
              foodGroup={getName(mealItem[0])}
            />
          )}

          {mealItem[1].quantity > 0 && mealItem[1].customItems.length == 0 && (
            <StandardMealItem
              icon={
                <NativeIcon
                  library="MaterialCommunityIcons"
                  name={getIcon(mealItem[0])}
                  size={20}
                  color={theme.colors.primary}
                />
              }
              quantity={mealItem[1].quantity}
              foodGroup={getName(mealItem[0])}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

export default MealContainer;
