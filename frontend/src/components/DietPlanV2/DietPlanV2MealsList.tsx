import { View } from "react-native";
import type { DietV2Meal } from "@/interfaces/IDietPlanV2";
import useStyles from "@/styles/useGlobalStyles";
import DietPlanV2MealCard from "./DietPlanV2MealCard";

interface DietPlanV2MealsListProps {
  meals: DietV2Meal[];
}

const DietPlanV2MealsList = ({ meals }: DietPlanV2MealsListProps) => {
  const { spacing } = useStyles();

  return (
    <View style={[spacing.pdHorizontalMd, spacing.gapDefault]}>
      {meals.map((meal, index) => (
        <DietPlanV2MealCard key={meal._id ?? `diet-v2-meal-${index}`} meal={meal} index={index} />
      ))}
    </View>
  );
};

export default DietPlanV2MealsList;
