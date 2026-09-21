import { semanticColors } from "@/themes/semanticColors";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { DietV2Meal } from "@/interfaces/IDietPlanV2";
import useStyles from "@/styles/useGlobalStyles";
import type { DietPlanV2CompletionMap } from "./dietPlanV2Consumption";
import { getDietPlanV2MealKey } from "./dietPlanV2Consumption";
import DietPlanV2MealCard from "./DietPlanV2MealCard";

interface DietPlanV2MealsListProps {
  meals: DietV2Meal[];
  completion: DietPlanV2CompletionMap;
  disabled?: boolean;
  onToggleRow: (mealIndex: number, rowKey: string) => void;
  onToggleMeal: (mealIndex: number) => void;
}

const DietPlanV2MealsList = ({
  meals,
  completion,
  disabled,
  onToggleRow,
  onToggleMeal,
}: DietPlanV2MealsListProps) => {
  const { spacing } = useStyles();

  if (meals.length === 0) {
    return (
      <View style={[spacing.pdHorizontalMd, styles.empty]}>
        <Text style={styles.emptyText}>אין תוכנית תזונה</Text>
      </View>
    );
  }

  return (
    <View style={[spacing.pdHorizontalMd, styles.list]}>
      {meals.map((meal, index) => {
        const mealKey = getDietPlanV2MealKey(meal, index);
        return (
          <DietPlanV2MealCard
            key={mealKey}
            meal={meal}
            index={index}
            completion={completion[mealKey]}
            disabled={disabled}
            onToggleRow={(rowKey) => onToggleRow(index, rowKey)}
            onToggleMeal={() => onToggleMeal(index)}
          />
        );
      })}
    </View>
  );
};

const styles = {
  list: { gap: 10 },
  empty: { paddingVertical: 40, alignItems: "center" },
  emptyText: { textAlign: "center", color: semanticColors.diet.secondaryText },
} as const;

export default DietPlanV2MealsList;
