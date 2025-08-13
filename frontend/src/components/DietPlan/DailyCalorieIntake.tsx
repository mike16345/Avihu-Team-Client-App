import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import { Text } from "../ui/Text";
import ProgressBar from "../ui/ProgressBar";
import Badge from "../ui/Badge";

const DailyCalorieIntake = () => {
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
        <ProgressBar value={1000} maxValue={calories.totalCalories} />
        <Badge alignStart showDot>
          <Text fontVariant="medium">{calories.freeCalories} קלוריות חופשיות בנוסף</Text>
        </Badge>
      </View>
    </View>
  );
};

export default DailyCalorieIntake;
