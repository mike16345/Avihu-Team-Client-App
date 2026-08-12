import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { DietV2FreeCalories as DietV2FreeCaloriesValue } from "@/interfaces/IDietPlanV2";
import { selectionHaptic } from "@/utils/haptics";
import { formatDietPlanV2Number } from "./dietPlanV2Utils";

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
  if (!freeCalories) return null;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        selectionHaptic();
        onToggle();
      }}
      style={[styles.container, consumed && styles.consumed]}
    >
      <View style={styles.headerRow}>
        <Text fontVariant="bold" fontSize={15} style={styles.title}>
          {`קלוריות חופשיות · ${formatDietPlanV2Number(freeCalories.calories)} קק"ל`}
        </Text>
        {consumed && (
          <View style={styles.checkBadge}>
            <Text fontVariant="bold" fontSize={11} style={styles.checkLabel}>
              ✓ נאכל
            </Text>
          </View>
        )}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    textAlign: "right",
  },
  description: {
    color: "#4B5563",
    textAlign: "right",
    lineHeight: 22,
  },
  descriptionConsumed: {
    color: "#4B7A62",
    textDecorationLine: "line-through",
    textDecorationColor: "#86EFAC",
  },
  checkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  checkLabel: {
    color: "#166534",
  },
});

export default DietPlanV2FreeCalories;
