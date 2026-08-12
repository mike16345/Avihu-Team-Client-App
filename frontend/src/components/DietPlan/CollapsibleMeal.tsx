import { FC, useEffect, useMemo, useRef, useState, Fragment } from "react";
import Collapsible from "../ui/Collapsible";
import { IDietItem, IMeal } from "@/interfaces/DietPlan";
import { ServingKey, useDietServingsStore } from "@/store/dietServingsStore";
import { StyleSheet, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import DietItemContent from "./DietItemContent";
import { foodGroupToName } from "@/utils/utils";
import { useRecordMeal } from "@/hooks/useRecordMeal";
import { Text } from "../ui/Text";
import Icon from "../Icon/Icon";
import { selectionHaptic } from "@/utils/haptics";
import useDietPlanV1Query from "@/hooks/queries/useDietPlanV1Query";

interface CollapsibleMealProps {
  meal: IMeal;
  index: number;
}

const dietItemKeyToServing: Record<string, ServingKey> = {
  totalProtein: "protein",
  totalCarbs: "carbs",
  totalFats: "fat",
  totalVeggies: "veg",
};

const TOLERANCE = 0.001;

type MacroKey = "protein" | "carbs" | "fat" | "veg";

const sumMealField = (meals: IMeal[], field: keyof IMeal): number =>
  meals.reduce((acc, m) => {
    const item = m[field] as IDietItem | undefined;
    return acc + (item?.quantity ?? 0);
  }, 0);

const CollapsibleMeal: FC<CollapsibleMealProps> = ({ meal, index }) => {
  const { session, recordMeal, cancelMeal } = useRecordMeal();
  const { layout, spacing } = useStyles();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const isEaten = useMemo(() => {
    if (!session?.meals) return false;

    const isEaten = session?.meals.find((m) => m.id == meal._id);

    return !!isEaten;
  }, [session?.meals]);

  const eatenCategories = useDietServingsStore((s) => s.eatenCategories);
  const toggleMealCategory = useDietServingsStore((s) => s.toggleMealCategory);
  const consumedProtein = useDietServingsStore((s) => s.protein);
  const consumedCarbs = useDietServingsStore((s) => s.carbs);
  const consumedFat = useDietServingsStore((s) => s.fat);
  const consumedVeg = useDietServingsStore((s) => s.veg);

  const { data: plan } = useDietPlanV1Query();

  const dailyTargets = useMemo<Record<MacroKey, number>>(() => {
    const allMeals = plan?.meals ?? [];
    return {
      protein: sumMealField(allMeals, "totalProtein"),
      carbs: sumMealField(allMeals, "totalCarbs"),
      fat: sumMealField(allMeals, "totalFats"),
      veg: plan?.veggiesPerDay ?? sumMealField(allMeals, "totalVeggies"),
    };
  }, [plan]);

  const mealQtys = useMemo<Record<MacroKey, number>>(
    () => ({
      protein: meal.totalProtein?.quantity ?? 0,
      carbs: meal.totalCarbs?.quantity ?? 0,
      fat: meal.totalFats?.quantity ?? 0,
      veg: meal.totalVeggies?.quantity ?? 0,
    }),
    [meal]
  );

  const consumed = useMemo<Record<MacroKey, number>>(
    () => ({
      protein: consumedProtein,
      carbs: consumedCarbs,
      fat: consumedFat,
      veg: consumedVeg,
    }),
    [consumedProtein, consumedCarbs, consumedFat, consumedVeg]
  );

  const canMarkMeal = useMemo(() => {
    const keys: MacroKey[] = ["protein", "carbs", "fat", "veg"];
    return keys.every((cat) => {
      const q = mealQtys[cat];
      if (q <= 0) return true;
      const target = dailyTargets[cat];
      if (target <= 0) return true;
      const alreadyOn = !!eatenCategories[`${meal._id}::${cat}`];
      const addOnMark = alreadyOn ? 0 : q;
      return consumed[cat] + addOnMark <= target + TOLERANCE;
    });
  }, [mealQtys, dailyTargets, eatenCategories, meal._id, consumed]);

  const dietItems = useMemo(() => {
    return Object.keys(meal)
      .filter((key) => key !== "_id")
      .filter((key) => {
        const item = meal[key as keyof IMeal] as IDietItem;
        return item?.quantity && item.quantity > 0;
      });
  }, [meal]);

  const relevantServingItems = useMemo(
    () =>
      dietItems
        .map((key) => {
          const item = meal[key as keyof IMeal] as IDietItem;
          const sk = dietItemKeyToServing[key];
          if (!sk || !item || item.quantity <= 0) return null;
          return { key: sk, quantity: item.quantity };
        })
        .filter((x): x is { key: ServingKey; quantity: number } => x !== null),
    [dietItems, meal]
  );

  const allCategoriesEaten = useMemo(() => {
    if (relevantServingItems.length === 0) return false;
    return relevantServingItems.every(({ key }) => !!eatenCategories[`${meal._id}::${key}`]);
  }, [relevantServingItems, eatenCategories, meal._id]);

  const syncingRef = useRef(false);

  useEffect(() => {
    if (syncingRef.current) return;
    if (allCategoriesEaten && !isEaten) {
      recordMeal(meal, index);
    } else if (!allCategoriesEaten && isEaten) {
      cancelMeal(meal._id);
    }
  }, [allCategoriesEaten, isEaten]);

  const handleMealPress = async () => {
    if (!isEaten && !canMarkMeal) return;
    selectionHaptic();
    syncingRef.current = true;
    try {
      if (isEaten) {
        relevantServingItems.forEach(({ key, quantity }) => {
          if (eatenCategories[`${meal._id}::${key}`]) {
            toggleMealCategory(meal._id, key, quantity);
          }
        });
        await cancelMeal(meal._id);
      } else {
        relevantServingItems.forEach(({ key, quantity }) => {
          if (!eatenCategories[`${meal._id}::${key}`]) {
            toggleMealCategory(meal._id, key, quantity);
          }
        });
        await recordMeal(meal, index);
      }
    } finally {
      setTimeout(() => {
        syncingRef.current = false;
      }, 50);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed((isCollapsed) => !isCollapsed);
  };

  const mealEatenIndicatorText = useMemo(
    () => (!isEaten ? "סיום ארוחה" : "ביטול סימון"),
    [isEaten]
  );

  return (
    <Collapsible
      trigger={
        <View
          style={[
            layout.flexRow,
            layout.itemsCenter,
            layout.justifyBetween,
            { paddingHorizontal: 18, paddingVertical: 14 },
          ]}
        >
          <Text fontSize={16} fontVariant="semibold">
            ארוחה {index + 1}
          </Text>
          <Icon name="chevronDown" rotation={isCollapsed ? 0 : 180} />
        </View>
      }
      variant={isEaten ? "success" : "gray"}
      isCollapsed={isCollapsed}
      onCollapseChange={toggleCollapse}
      style={[{ padding: 0 }, !isEaten && styles.mealCard]}
    >
      <View
        style={[
          layout.flex1,
          layout.flexGrow,
          spacing.gapLg,
          { paddingTop: 12, paddingHorizontal: 18 },
        ]}
      >
        {dietItems.map((dietItem, i) => {
          return (
            <Fragment key={`${dietItem}-${i}`}>
              {i > 0 && <View style={styles.categoryDivider} />}
              <DietItemContent
                name={foodGroupToName(dietItem)}
                dietItem={meal[dietItem as keyof IMeal] as IDietItem}
                mealId={meal._id}
                servingKey={dietItemKeyToServing[dietItem]}
              />
            </Fragment>
          );
        })}
        <PrimaryButton
          style={{ marginBottom: !isEaten && !canMarkMeal ? 4 : 20 }}
          mode={isEaten ? "light" : "dark"}
          onPress={handleMealPress}
          disabled={!isEaten && !canMarkMeal}
          block
        >
          {mealEatenIndicatorText}
        </PrimaryButton>
        {!isEaten && !canMarkMeal && (
          <Text fontSize={12} style={styles.blockedHint}>
            אין מספיק מנות פנויות היום
          </Text>
        )}
      </View>
    </Collapsible>
  );
};

const styles = StyleSheet.create({
  mealCard: {
    backgroundColor: "#F7F8F9",
  },
  categoryDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginVertical: 8,
  },
  blockedHint: {
    color: "#0F5E3B",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 6,
    lineHeight: 16,
  },
});

export default CollapsibleMeal;
