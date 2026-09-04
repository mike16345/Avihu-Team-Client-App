import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Text } from "@/components/ui/Text";
import type { DietV2Meal } from "@/interfaces/IDietPlanV2";
import { selectionHaptic } from "@/utils/haptics";
import DietPlanV2CategoryRow from "./DietPlanV2CategoryRow";
import DietPlanV2AddOns from "./DietPlanV2AddOns";
import DietPlanV2FreeCalories from "./DietPlanV2FreeCalories";
import type { DietPlanV2MealCompletion } from "./dietPlanV2Consumption";
import {
  deriveDietPlanV2MealMacros,
  formatDietPlanV2MealMacroSummary,
  formatDietPlanV2Number,
} from "./dietPlanV2Utils";
import {
  ChevronDownIcon,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  MoonIcon,
  SunriseIcon,
  SunIcon,
} from "./dietV2Icons";

interface DietPlanV2MealCardProps {
  meal: DietV2Meal;
  index: number;
  completion?: DietPlanV2MealCompletion;
  disabled?: boolean;
  onToggleRow: (rowKey: string) => void;
  onToggleMeal: () => void;
}

const MEAL_TIME_ICONS = [SunriseIcon, SunIcon, MoonIcon] as const;

const DietPlanV2MealCard = ({
  meal,
  index,
  completion,
  disabled,
  onToggleRow,
  onToggleMeal,
}: DietPlanV2MealCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const selectedRows = new Set(completion?.selectedRows ?? []);
  const allConsumed = completion?.completed ?? false;
  const displayName = meal.name.trim() || `ארוחה ${index + 1}`;
  const macros = deriveDietPlanV2MealMacros(meal);
  const MealTimeIcon = MEAL_TIME_ICONS[index % MEAL_TIME_ICONS.length];

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(20).stiffness(180)}
      style={[styles.card, allConsumed && styles.cardConsumed]}
    >
      <Pressable
        onPress={() => {
          selectionHaptic();
          setIsCollapsed((current) => !current);
        }}
        style={styles.header}
      >
        <View style={styles.iconCircle}>
          <MealTimeIcon size={22} color={DIET_V2_GREEN} />
        </View>
        <View style={styles.headerText}>
          <Text fontSize={16} fontVariant="bold" style={styles.mealTitle}>
            {displayName}
          </Text>
          <Text
            fontSize={12}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.78}
            style={styles.summary}
          >
            {formatDietPlanV2MealMacroSummary(macros)}
          </Text>
          {meal.freeCalories && (
            <View style={styles.freeChip}>
              <Text fontSize={11} fontVariant="bold" style={styles.freeChipLabel}>
                {`+ ${formatDietPlanV2Number(meal.freeCalories.calories)} קק"ל חופשי`}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.chevron, !isCollapsed && styles.chevronExpanded]}>
          <ChevronDownIcon size={20} color={DIET_V2_GREEN} />
        </View>
      </Pressable>

      {!isCollapsed && (
        <Animated.View
          entering={FadeInDown.duration(220).springify().damping(18).stiffness(160)}
          exiting={FadeOutUp.duration(150)}
          style={styles.body}
        >
          {meal.categories.map((category, categoryIndex) => {
            if (!category.items.some(({ name }) => name.trim().length > 0)) return null;
            const rowKey = `category:${category.category}:${categoryIndex}`;

            return (
              <DietPlanV2CategoryRow
                key={rowKey}
                category={category}
                consumed={selectedRows.has(rowKey)}
                disabled={disabled}
                onToggle={() => onToggleRow(rowKey)}
              />
            );
          })}

          <DietPlanV2AddOns
            addOns={meal.addOns}
            consumed={selectedRows.has("add-ons")}
            disabled={disabled}
            onToggle={() => onToggleRow("add-ons")}
          />

          <DietPlanV2FreeCalories
            freeCalories={meal.freeCalories}
            consumed={selectedRows.has("free-calories")}
            disabled={disabled}
            onToggle={() => onToggleRow("free-calories")}
          />

          <PrimaryButton
            style={styles.finishButton}
            mode="dark"
            disabled={disabled}
            onPress={() => {
              selectionHaptic();
              onToggleMeal();
            }}
            block
          >
            {allConsumed ? "בטל סימון" : "אכלתי הכל"}
          </PrimaryButton>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 94, 59, 0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    overflow: "hidden",
  },
  cardConsumed: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DIET_V2_MINT,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    alignItems: "flex-start",
  },
  mealTitle: {
    color: "#0B2A22",
  },
  summary: {
    color: "#4B5563",
    marginTop: 2,
  },
  freeChip: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
  },
  freeChipLabel: {
    color: "#166534",
  },
  chevron: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronExpanded: {
    transform: [{ rotate: "180deg" }],
  },
  body: {
    paddingTop: 4,
    paddingBottom: 16,
    paddingHorizontal: 14,
    gap: 12,
  },
  finishButton: {
    marginTop: 8,
  },
});

export default DietPlanV2MealCard;
