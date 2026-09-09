import { FC } from "react";
import CollapsibleMeal from "./CollapsibleMeal";
import ServingsTracker from "./ServingsTracker";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import useDietPlanV1Query from "@/hooks/queries/useDietPlanV1Query";
import { ConditionalRender } from "../ui/ConditionalRender";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { Text } from "../ui/Text";
import { IMeal } from "@/interfaces/DietPlan";

const MealsList: FC = () => {
  const { spacing, layout } = useStyles();
  const { data, isLoading } = useDietPlanV1Query();
  const meals = data?.meals || [];

  return (
    <View style={[spacing.gap20, spacing.pdHorizontalMd]}>
      <ConditionalRender condition={isLoading}>
        <View style={[layout.center]}>
          <SpinningIcon mode="light" />
        </View>
      </ConditionalRender>

      <ConditionalRender condition={!meals.length && !isLoading}>
        <Text style={{ textAlign: "center" }}>אין תוכנית תזונה</Text>
      </ConditionalRender>

      <ConditionalRender condition={!!meals.length && !isLoading}>
        <ServingsTracker />
      </ConditionalRender>

      {meals.map((meal: IMeal, i: number) => (
        <CollapsibleMeal key={meal._id ?? i} meal={meal} index={i} />
      ))}
    </View>
  );
};

export default MealsList;
