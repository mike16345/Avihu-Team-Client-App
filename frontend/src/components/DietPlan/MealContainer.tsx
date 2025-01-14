import { IMeal } from "@/interfaces/DietPlan";
import React from "react";
import { View } from "react-native";
import CustomInstructionsContainer from "./CustomInstructionsContainer";
import useStyles from "@/styles/useGlobalStyles";
import MenuItemTicket from "./MenuItemTicket";

interface MealContainerProps {
  meal: IMeal;
}

const MealContainer: React.FC<MealContainerProps> = ({ meal }) => {
  const { layout, spacing } = useStyles();

  const mealItems = Object.entries(meal);

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
    <View
      style={[
        layout.rtl,
        layout.flexDirectionByPlatform,
        layout.itemsCenter,
        layout.wrap,
        spacing.gapDefault,
        spacing.pdDefault,
      ]}
    >
      {mealItems.map((mealItem, i) => {
        return (
          <React.Fragment key={mealItem[1]._id + i}>
            {mealItem[1].customItems && mealItem[1].customItems.length > 0 && (
              <CustomInstructionsContainer item={mealItem[1]} foodGroup={getName(mealItem[0])} />
            )}

            {mealItem[1].quantity > 0 && mealItem[1].customItems.length == 0 && (
              <MenuItemTicket foodGroup={getName(mealItem[0])} quantity={mealItem[1].quantity} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default MealContainer;
