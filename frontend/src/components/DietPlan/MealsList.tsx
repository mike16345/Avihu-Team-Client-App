import { FC } from "react";
import { IMeal } from "@/interfaces/DietPlan";
import CollapsibleMeal from "./CollapsibleMeal";
import { ScrollView } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

interface MealsListProps {
  meals: IMeal[];
}

const MealsList: FC<MealsListProps> = ({ meals = [] }) => {
  const { spacing } = useStyles();

  return (
    <ScrollView contentContainerStyle={[spacing.gap20]}>
      {meals.map((meal, i) => {
        return <CollapsibleMeal key={i} meal={meal} index={i} />;
      })}
    </ScrollView>
  );
};

export default MealsList;
