import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { DietV2FreeCalories as DietV2FreeCaloriesValue } from "@/interfaces/IDietPlanV2";
import useStyles from "@/styles/useGlobalStyles";
import { DIET_V2_DARK, DIET_V2_GREEN, DIET_V2_MINT } from "./dietV2Icons";

interface DietPlanV2FreeCaloriesProps {
  freeCalories?: DietV2FreeCaloriesValue;
}

const DietPlanV2FreeCalories = ({ freeCalories }: DietPlanV2FreeCaloriesProps) => {
  const { spacing } = useStyles();

  if (!freeCalories) {
    return null;
  }

  return (
    <View style={[styles.container, spacing.gapSm]}>
      <Text fontSize={14} fontVariant="semibold" style={styles.title}>
        {`קלוריות חופשיות · ${freeCalories.calories} קק״ל`}
      </Text>
      <Text fontSize={14} style={styles.description}>
        {freeCalories.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    backgroundColor: DIET_V2_MINT,
    padding: 14,
  },
  title: {
    color: DIET_V2_GREEN,
  },
  description: {
    color: DIET_V2_DARK,
    lineHeight: 20,
    textAlign: "right",
  },
});

export default DietPlanV2FreeCalories;
