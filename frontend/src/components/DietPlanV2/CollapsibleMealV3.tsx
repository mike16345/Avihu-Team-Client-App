import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Text } from "@/components/ui/Text";
import { DietV2Meal } from "@/interfaces/DietPlanV2";
import { selectionHaptic } from "@/utils/haptics";
import DietItemContentV2 from "./DietItemContentV2";
import { computeMealTotalsFromCategories } from "./dietPlanV2ClientUtils";
import {
  DIET_V2_GREEN,
  DIET_V2_MINT,
  SunriseIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
} from "./dietV2Icons";

interface CollapsibleMealV3Props {
  meal: DietV2Meal;
  index: number;
  freeCalories?: number;
}

const MEAL_TIME_ICONS = [SunriseIcon, SunIcon, MoonIcon] as const;

const CollapsibleMealV3: React.FC<CollapsibleMealV3Props> = ({ meal, index, freeCalories = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [consumedKinds, setConsumedKinds] = useState<Set<string>>(new Set());

  const toggleCollapse = () => {
    selectionHaptic();
    setIsCollapsed((prev) => !prev);
  };

  const toggleCategoryConsumed = (kind: string) => {
    setConsumedKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  const hasFree = freeCalories > 0;
  const freeConsumed = consumedKinds.has("freeCalories");

  const nonEmptyKinds = [
    ...meal.categories.filter((c) => c.options.length > 0).map((c) => c.kind),
    ...(hasFree ? ["freeCalories"] : []),
  ];
  const allConsumed = nonEmptyKinds.length > 0 && nonEmptyKinds.every((k) => consumedKinds.has(k));

  const handleMealPress = () => {
    selectionHaptic();
    setConsumedKinds(allConsumed ? new Set() : new Set(nonEmptyKinds));
  };

  const toggleFreeConsumed = () => {
    selectionHaptic();
    toggleCategoryConsumed("freeCalories");
  };

  const totals = computeMealTotalsFromCategories(meal.categories);
  const MealTimeIcon = MEAL_TIME_ICONS[index % MEAL_TIME_ICONS.length];

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(20).stiffness(180)}
      style={[styles.card, allConsumed && styles.cardConsumed]}
    >
      <Pressable onPress={toggleCollapse} style={styles.header}>
        <View style={styles.iconCircle}>
          <MealTimeIcon size={22} color={DIET_V2_GREEN} />
        </View>
        <View style={styles.headerText}>
          <Text fontSize={16} fontVariant="bold" style={styles.mealTitle}>
            ארוחה {index + 1}
          </Text>
          <Text fontSize={12} style={styles.summary}>
            {`${totals.calories} קק"ל   ·   ${totals.protein} ג' חלבון   ·   ${totals.carbs} ג' פחמימה   ·   ${totals.fat} ג' שומן`}
          </Text>
          {hasFree && (
            <View style={styles.freeChip}>
              <Text fontSize={11} fontVariant="bold" style={styles.freeChipLabel}>
                {`+ ${Math.round(freeCalories)} קק"ל חופשי`}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.chevron}>
          <ChevronDownIcon size={20} color={DIET_V2_GREEN} />
        </View>
      </Pressable>

      {!isCollapsed && (
        <Animated.View
          entering={FadeInDown.duration(220).springify().damping(18).stiffness(160)}
          exiting={FadeOutUp.duration(150)}
          style={styles.body}
        >
          {meal.categories.map((category, i) => (
            <DietItemContentV2
              key={`${category.kind}-${i}`}
              category={category}
              consumed={consumedKinds.has(category.kind)}
              onToggle={() => toggleCategoryConsumed(category.kind)}
            />
          ))}
          {hasFree && (
            <Pressable
              onPress={toggleFreeConsumed}
              style={[styles.freeCat, freeConsumed && styles.freeCatConsumed]}
            >
              <View style={styles.freeCatHeaderRow}>
                <Text fontVariant="bold" fontSize={15} style={styles.freeCatTitle}>
                  {`קלוריות חופשיות · ${Math.round(freeCalories)} קק"ל`}
                </Text>
                {freeConsumed && (
                  <View style={styles.checkBadge}>
                    <Text fontVariant="bold" fontSize={11} style={styles.checkLabel}>
                      ✓ נאכל
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.freeCatBodyWrap}>
                <Text
                  fontSize={15}
                  style={[styles.freeCatBody, freeConsumed && styles.freeCatBodyConsumed]}
                >
                  לבחירתך — פרי / חטיף / כף ממרח
                </Text>
              </View>
            </Pressable>
          )}
          <PrimaryButton style={styles.finishBtn} mode="dark" onPress={handleMealPress} block>
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
    textAlign: "right",
  },
  summary: {
    color: "#4B5563",
    marginTop: 2,
    textAlign: "right",
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
  body: {
    paddingTop: 4,
    paddingBottom: 16,
    paddingHorizontal: 14,
    gap: 12,
  },
  freeCat: {
    gap: 4,
    alignSelf: "stretch",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(15, 94, 59, 0.10)",
  },
  freeCatConsumed: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  freeCatHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "space-between",
    gap: 8,
  },
  freeCatTitle: {
    color: "#0B2A22",
    textAlign: "right",
  },
  freeCatBodyWrap: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  freeCatBody: {
    color: "#4B5563",
    textAlign: "right",
    lineHeight: 22,
  },
  freeCatBodyConsumed: {
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
  finishBtn: {
    marginTop: 8,
  },
});

export default CollapsibleMealV3;
