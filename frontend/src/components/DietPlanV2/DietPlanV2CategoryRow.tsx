import { semanticColors } from "@/themes/semanticColors";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { DietV2Category } from "@/interfaces/IDietPlanV2";
import { selectionHaptic } from "@/utils/haptics";
import {
  DIET_V2_CATEGORY_LABELS,
  formatDietV2CategoryItems,
  formatDietV2CategoryMacros,
} from "./dietPlanV2Utils";
import DietPlanV2ConsumedBadge from "./DietPlanV2ConsumedBadge";
import { getDietPlanV2MealRowVisualState } from "./dietPlanV2MealRowVisualState";

interface DietPlanV2CategoryRowProps {
  category: DietV2Category;
  consumed: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const DietPlanV2CategoryRow = ({
  category,
  consumed,
  disabled,
  onToggle,
}: DietPlanV2CategoryRowProps) => {
  const visualState = getDietPlanV2MealRowVisualState(consumed);

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
        <View style={styles.titleGroup}>
          <Text fontVariant="bold" fontSize={15} style={styles.header}>
            {DIET_V2_CATEGORY_LABELS[category.category]}
          </Text>
          <Text fontSize={11} numberOfLines={1} style={styles.macros}>
            {formatDietV2CategoryMacros(category)}
          </Text>
        </View>
        <DietPlanV2ConsumedBadge consumed={consumed} />
      </View>
      <Text fontSize={15} style={[styles.body, consumed && styles.bodyConsumed]}>
        {formatDietV2CategoryItems(category)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
    alignItems: "flex-start",
    alignSelf: "stretch",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderColor: "transparent",
    borderBottomColor: semanticColors.app.dietSectionDivider,
  },
  consumed: {
    backgroundColor: semanticColors.diet.mintStrong,
    borderWidth: 1,
    borderColor: semanticColors.app.dietSectionBorder,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  header: {
    color: semanticColors.diet.primaryText,
  },
  titleGroup: {
    alignItems: "flex-start",
    gap: 1,
  },
  macros: {
    color: semanticColors.scanner.panelText,
  },
  body: {
    color: semanticColors.diet.secondaryText,
    lineHeight: 22,
  },
  bodyConsumed: {
    color: semanticColors.diet.tertiaryText,
    textDecorationLine: "line-through",
    textDecorationColor: semanticColors.diet.borderStrong,
  },
});

export default DietPlanV2CategoryRow;
