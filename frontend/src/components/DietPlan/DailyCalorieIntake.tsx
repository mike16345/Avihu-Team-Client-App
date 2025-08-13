import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import { Text } from "../ui/Text";
import ProgressBar from "../ui/ProgressBar";
import Badge from "../ui/Badge";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import { useDietPlanStore } from "@/store/useDietPlanStore";

const DailyCalorieIntake = () => {
  const totalCaloriesEaten = useDietPlanStore((state) => state.totalCaloriesEaten);
  const { data } = useDietPlanQuery();
  const { totalCalories = 0, freeCalories = 0 } = data || {};
  // TODO: Change this to useDietPlanQuery and destructure calories
  const calories = {
    totalCalories: 1620,
    freeCalories: 250,
  };

  const { layout, spacing, fonts } = useStyles();

  return (
    <View style={[layout.flexRow, layout.widthFull]}>
      <View style={[layout.widthFull, spacing.gapLg]}>
        <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
          <Text fontVariant="bold" style={[fonts.xl]}>
            {calories.totalCalories}
          </Text>
          <Text>קלוריות יומיות</Text>
        </View>
        <ProgressBar value={totalCaloriesEaten} maxValue={calories.totalCalories} />
        <Badge alignStart showDot>
          <Text fontVariant="medium">{calories.freeCalories} קלוריות חופשיות בנוסף</Text>
        </Badge>
      </View>
    </View>
  );
};

export default DailyCalorieIntake;
