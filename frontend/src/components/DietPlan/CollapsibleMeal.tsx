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

  const dietItems = useMemo(() => {
    return Object.keys(meal).filter((key) => key !== "_id");
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
    return relevantServingItems.every(
      ({ key }) => !!eatenCategories[`${meal._id}::${key}`]
    );
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

  const handleMealPress = () => {
    selectionHaptic();
    syncingRef.current = true;
    if (isEaten) {
      cancelMeal(meal._id);
      relevantServingItems.forEach(({ key, quantity }) => {
        if (eatenCategories[`${meal._id}::${key}`]) {
          toggleMealCategory(meal._id, key, quantity);
        }
      });
    } else {
      recordMeal(meal, index);
      relevantServingItems.forEach(({ key, quantity }) => {
        if (!eatenCategories[`${meal._id}::${key}`]) {
          toggleMealCategory(meal._id, key, quantity);
        }
      });
    }
    setTimeout(() => {
      syncingRef.current = false;
    }, 100);
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
          style={{ marginBottom: 20 }}
          mode={isEaten ? "light" : "dark"}
          onPress={handleMealPress}
          block
        >
          {mealEatenIndicatorText}
        </PrimaryButton>
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
});

export default CollapsibleMeal;
