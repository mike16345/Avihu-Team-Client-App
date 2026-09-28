import { FC, useCallback, useRef } from "react";
import CollapsibleMeal from "./CollapsibleMeal";
import ServingsTracker from "./ServingsTracker";
import { Animated, Easing, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import useDietPlanV1Query from "@/hooks/queries/useDietPlanV1Query";
import { ConditionalRender } from "../ui/ConditionalRender";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { Text } from "../ui/Text";
import { IMeal } from "@/interfaces/DietPlan";
import { useFocusEffect } from "@react-navigation/native";

const STAGGER_MS = 100;
const ITEM_DURATION_MS = 480;

const StaggeredItem: React.FC<{ index: number; playKey: number; children: React.ReactNode }> = ({
  index,
  playKey,
  children,
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      progress.setValue(0);
      const anim = Animated.timing(progress, {
        toValue: 1,
        duration: ITEM_DURATION_MS,
        delay: index * STAGGER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
      anim.start();
      return () => anim.stop();
    }, [progress, index, playKey])
  );

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  return (
    <Animated.View style={{ width: "100%", opacity: progress, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

const MealsList: FC = () => {
  const { spacing, layout } = useStyles();
  const { data, isLoading } = useDietPlanV1Query();
  const meals = data?.meals || [];
  const playKey = meals.length;

  return (
    <View style={[spacing.gapDefault, spacing.pdHorizontalMd]}>
      <ConditionalRender condition={isLoading}>
        <View style={[layout.center]}>
          <SpinningIcon mode="light" />
        </View>
      </ConditionalRender>

      <ConditionalRender condition={!meals.length && !isLoading}>
        <Text style={{ textAlign: "center" }}>אין תוכנית תזונה</Text>
      </ConditionalRender>

      <ConditionalRender condition={!!meals.length && !isLoading}>
        <StaggeredItem index={0} playKey={playKey}>
          <ServingsTracker />
        </StaggeredItem>
      </ConditionalRender>

      {meals.map((meal: IMeal, i: number) => (
        <StaggeredItem key={meal._id ?? i} index={i + 1} playKey={playKey}>
          <CollapsibleMeal meal={meal} index={i} />
        </StaggeredItem>
      ))}
    </View>
  );
};

export default MealsList;
