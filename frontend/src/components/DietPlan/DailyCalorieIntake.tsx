import { semanticColors } from "@/themes/semanticColors";
import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import { Text } from "../ui/Text";
import ProgressBar from "../ui/ProgressBar";
import Badge from "../ui/Badge";
import useDietPlanV1Query from "@/hooks/queries/useDietPlanV1Query";
import { useDietPlanStore } from "@/store/useDietPlanStore";
import { useRecordMeal } from "@/hooks/useRecordMeal";
import { selectionHaptic } from "@/utils/haptics";

const DailyCalorieIntake = () => {
  const { layout, spacing } = useStyles();
  const totalCaloriesEaten = useDietPlanStore((state) => state.totalCaloriesEaten);
  const { data } = useDietPlanV1Query();
  const { totalCalories = 0, freeCalories = 0 } = data || {};
  const { session, recordFreeCalorieConsumption } = useRecordMeal();

  const handlePress = async () => {
    await recordFreeCalorieConsumption(!session?.freeCaloriesConsumed, freeCalories);
    selectionHaptic();
  };

  return (
    <View style={[layout.flexRow, layout.widthFull]}>
      <View style={[layout.widthFull, spacing.gap20]}>
        <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
          <Text fontVariant="bold" fontSize={24}>
            {totalCalories}
          </Text>
          <Text fontSize={16}>קלוריות יומיות</Text>
        </View>
        <ProgressBar value={totalCaloriesEaten} maxValue={totalCalories} />
        <Badge
          style={[
            session?.freeCaloriesConsumed
              ? { backgroundColor: semanticColors.successContainer }
              : {},
          ]}
          alignStart
          showDot
          onPress={handlePress}
        >
          <Text fontVariant="medium">{freeCalories} קלוריות חופשיות </Text>
        </Badge>
      </View>
    </View>
  );
};

export default DailyCalorieIntake;
