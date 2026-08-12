import { Fragment, useState } from "react";
import { StyleSheet, View } from "react-native";
import Icon from "@/components/Icon/Icon";
import Collapsible from "@/components/ui/Collapsible";
import { Text } from "@/components/ui/Text";
import type { DietV2Meal } from "@/interfaces/IDietPlanV2";
import useStyles from "@/styles/useGlobalStyles";
import DietPlanV2CategoryRow from "./DietPlanV2CategoryRow";
import DietPlanV2FreeCalories from "./DietPlanV2FreeCalories";
import { DIET_V2_DARK, DIET_V2_GREEN, DIET_V2_MINT } from "./dietV2Icons";
import { getVisibleDietV2Categories } from "./dietPlanV2Utils";

interface DietPlanV2MealCardProps {
  meal: DietV2Meal;
  index: number;
}

const DietPlanV2MealCard = ({ meal, index }: DietPlanV2MealCardProps) => {
  const { layout, spacing } = useStyles();
  const [isCollapsed, setIsCollapsed] = useState(index !== 0);
  const visibleCategories = getVisibleDietV2Categories(meal);
  const displayName = meal.name.trim().length > 0 ? meal.name : `ארוחה ${index + 1}`;

  return (
    <Collapsible
      trigger={
        <View style={styles.trigger}>
          <View style={styles.triggerCopy}>
            <Text fontSize={17} fontVariant="semibold" style={styles.mealName}>
              {displayName}
            </Text>
            <View style={styles.badgeRow}>
              <Text fontSize={12} style={styles.calorieBadge}>
                {`${meal.macros.calories} קק״ל`}
              </Text>
              {meal.freeCalories && (
                <Text fontSize={12} fontVariant="semibold" style={styles.freeBadge}>
                  {`+ ${meal.freeCalories.calories} קק״ל חופשי`}
                </Text>
              )}
            </View>
          </View>
          <Icon name="chevronDown" rotation={isCollapsed ? 0 : 180} />
        </View>
      }
      variant="white"
      isCollapsed={isCollapsed}
      onCollapseChange={() => setIsCollapsed((current) => !current)}
      style={styles.card}
    >
      <View style={[layout.flex1, spacing.gapLg, styles.content]}>
        <View style={styles.macrosRow}>
          <View style={styles.macroItem}>
            <Text fontSize={12} style={styles.macroLabel}>
              קלוריות
            </Text>
            <Text fontSize={16} fontVariant="bold" style={styles.macroValue}>
              {meal.macros.calories}
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text fontSize={12} style={styles.macroLabel}>
              חלבון
            </Text>
            <Text fontSize={16} fontVariant="bold" style={styles.macroValue}>
              {`${meal.macros.protein} גר׳`}
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text fontSize={12} style={styles.macroLabel}>
              פחמימות
            </Text>
            <Text fontSize={16} fontVariant="bold" style={styles.macroValue}>
              {`${meal.macros.carbs} גר׳`}
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text fontSize={12} style={styles.macroLabel}>
              שומן
            </Text>
            <Text fontSize={16} fontVariant="bold" style={styles.macroValue}>
              {`${meal.macros.fat} גר׳`}
            </Text>
          </View>
        </View>

        <View>
          {visibleCategories.map((category, categoryIndex) => (
            <Fragment key={`${category.category}-${categoryIndex}`}>
              {categoryIndex > 0 && <View style={styles.divider} />}
              <DietPlanV2CategoryRow category={category} />
            </Fragment>
          ))}
        </View>

        <DietPlanV2FreeCalories freeCalories={meal.freeCalories} />
      </View>
    </Collapsible>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 15,
    gap: 12,
  },
  triggerCopy: {
    flex: 1,
    gap: 7,
  },
  mealName: {
    color: DIET_V2_DARK,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  calorieBadge: {
    color: "#4B5563",
  },
  freeBadge: {
    color: DIET_V2_GREEN,
    backgroundColor: DIET_V2_MINT,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 20,
  },
  macrosRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#F7F8F9",
    borderRadius: 14,
    paddingVertical: 12,
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  macroLabel: {
    color: "#6B7280",
  },
  macroValue: {
    color: DIET_V2_DARK,
    writingDirection: "ltr",
    fontVariant: ["tabular-nums"],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginVertical: 14,
  },
});

export default DietPlanV2MealCard;
