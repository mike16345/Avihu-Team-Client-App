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

interface CollapsibleMealV2Props {
  meal: DietV2Meal;
  index: number;
}

const MEAL_TIME_ICONS = [SunriseIcon, SunIcon, MoonIcon] as const;

const CollapsibleMealV2: React.FC<CollapsibleMealV2Props> = ({ meal, index }) => {
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

  const nonEmptyKinds = meal.categories.filter((c) => c.options.length > 0).map((c) => c.kind);
  const allConsumed = nonEmptyKinds.length > 0 && nonEmptyKinds.every((k) => consumedKinds.has(k));

  const handleMealPress = () => {
    selectionHaptic();
    setConsumedKinds(allConsumed ? new Set() : new Set(nonEmptyKinds));
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
            {`${totals.calories} קל'   ·   ${totals.protein} ג' חלבון   ·   ${totals.carbs} ג' פחמימה   ·   ${totals.fat} ג' שומן`}
          </Text>
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
  finishBtn: {
    marginTop: 8,
  },
});

export default CollapsibleMealV2;
