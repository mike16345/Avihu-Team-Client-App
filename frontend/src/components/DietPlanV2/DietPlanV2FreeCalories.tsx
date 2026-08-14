import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { DietV2FreeCalories as DietV2FreeCaloriesValue } from "@/interfaces/IDietPlanV2";
import { selectionHaptic } from "@/utils/haptics";
import { formatDietPlanV2Number } from "./dietPlanV2Utils";
import DietPlanV2ConsumedBadge from "./DietPlanV2ConsumedBadge";
import { getDietPlanV2MealRowVisualState } from "./dietPlanV2MealRowVisualState";

interface DietPlanV2FreeCaloriesProps {
  freeCalories?: DietV2FreeCaloriesValue;
  consumed: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const DietPlanV2FreeCalories = ({
  freeCalories,
  consumed,
  disabled,
  onToggle,
}: DietPlanV2FreeCaloriesProps) => {
  const visualState = getDietPlanV2MealRowVisualState(consumed);
  if (!freeCalories) return null;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        selectionHaptic();
        onToggle();
      }}
      style={[
        styles.container,
        { borderWidth: visualState.layout.borderWidth },
        consumed && styles.consumed,
      ]}
    >
      <View style={styles.headerRow}>
        <Text fontVariant="bold" fontSize={15} style={styles.title}>
          {`קלוריות חופשיות · ${formatDietPlanV2Number(freeCalories.calories)} קק"ל`}
        </Text>
        <DietPlanV2ConsumedBadge consumed={consumed} />
      </View>
      <Text fontSize={15} style={[styles.description, consumed && styles.descriptionConsumed]}>
        {freeCalories.description}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
    alignSelf: "stretch",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderColor: "transparent",
    borderBottomColor: "rgba(15, 94, 59, 0.10)",
  },
  consumed: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    color: "#0B2A22",
  },
  description: {
    color: "#4B5563",
    lineHeight: 22,
  },
  descriptionConsumed: {
    color: "#4B7A62",
    textDecorationLine: "line-through",
    textDecorationColor: "#86EFAC",
  },
});

export default DietPlanV2FreeCalories;
