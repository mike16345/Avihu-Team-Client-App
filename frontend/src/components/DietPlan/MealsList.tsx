import { FC } from "react";
import CollapsibleMeal from "./CollapsibleMeal";
import { ScrollView, useWindowDimensions, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import { ConditionalRender } from "../ui/ConditionalRender";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { Text } from "../ui/Text";

interface MealsListProps {}

const MealsList: FC<MealsListProps> = () => {
  const { height } = useWindowDimensions();
  const { spacing, layout } = useStyles();
  const { data, isLoading } = useDietPlanQuery();
  const meals = data?.meals || [];

  return (
    <View style={[{ height: height * 0.55 }]}>
      <ScrollView
        style={{ flexGrow: 1 }}
        contentContainerStyle={[{ flexGrow: 1 }, spacing.gap20]}
        showsVerticalScrollIndicator={false}
      >
        <ConditionalRender condition={isLoading}>
          <View style={[layout.center]}>
            <SpinningIcon mode="light" />
          </View>
        </ConditionalRender>

        <ConditionalRender condition={!meals.length && !isLoading}>
          <Text style={{ textAlign: "center" }}>אין תוכנית תזונה</Text>
        </ConditionalRender>

        {meals.map((meal, i) => {
          return <CollapsibleMeal key={meal._id ?? i} meal={meal} index={i} />;
        })}
      </ScrollView>
    </View>
  );
};

export default MealsList;
