import { IMeal } from "@/interfaces/DietPlan";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomInstructionsContainer from "./CustomInstructionsContainer";
import StandardMealItem from "./StandardMealItem";

interface MealContainerProps {
  meal: IMeal;
}

const MealContainer: React.FC<MealContainerProps> = ({ meal }) => {
  const { totalCarbs, totalProtein, totalFats, totalVeggies } = meal;
  return (
    <View style={styles.mealItemsContainer}>
      {totalProtein.customInstructions && totalProtein.customInstructions[0] ? (
        <CustomInstructionsContainer
          customInstructions={totalProtein.customInstructions}
          icon="fish"
          foodGroup="חלבונים"
        />
      ) : (
        totalProtein &&
        totalProtein.quantity > 0 && (
          <StandardMealItem iconName="fish" quantity={totalProtein.quantity} />
        )
      )}

      {totalCarbs.customInstructions && totalCarbs.customInstructions[0] ? (
        <CustomInstructionsContainer
          customInstructions={totalCarbs.customInstructions}
          icon="baguette"
          foodGroup="פחמימות"
        />
      ) : (
        totalCarbs.quantity > 0 && (
          <StandardMealItem iconName="baguette" quantity={totalCarbs.quantity} />
        )
      )}
      {totalFats && totalFats.quantity > 0 && (
        <StandardMealItem iconName="cheese" quantity={totalFats.quantity} />
      )}
      {totalVeggies && totalVeggies?.quantity > 0 && (
        <StandardMealItem iconName="leaf" quantity={totalVeggies.quantity} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mealItemsContainer: {
    direction: "rtl",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: `wrap`,
    gap: 8,
    width: "80%",
    padding: 10,
  },
  mealCol: {
    display: `flex`,
    alignItems: `flex-start`,
    justifyContent: `flex-end`,
  },
});

export default MealContainer;
