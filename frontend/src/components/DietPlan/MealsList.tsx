import { FC } from "react";
import { IMeal } from "@/interfaces/DietPlan";
import CollapsibleMeal from "./CollapsibleMeal";
import { ScrollView, useWindowDimensions, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

interface MealsListProps {
  meals: IMeal[];
}

const MealsList: FC<MealsListProps> = ({ meals = [] }) => {
  const { height } = useWindowDimensions();
  const { spacing } = useStyles();

  return (
    <View style={[{ height: height * 0.5 }]}>
      <ScrollView style={{ flexGrow: 1 }} contentContainerStyle={[{ flexGrow: 1 }, spacing.gap20]}>
        {meals.map((meal, i) => {
          return <CollapsibleMeal key={meal._id ?? i} meal={meal} index={i} />;
        })}
      </ScrollView>
    </View>
  );
};

export default MealsList;
