import { Pressable, StyleSheet, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import GreenDotGenerator from "../ui/GreenDotGenerator";
import { Text } from "../ui/Text";
import { IDietItem, IMeal } from "@/interfaces/DietPlan";
import FoodItemSelection from "./FoodItemSelection";
import { foodGroupToApiFoodGroupName } from "@/utils/utils";
import { FoodGroup } from "@/types/foodTypes";
import AdditionalDietItemsModal from "./AdditionalDietItemsModal";
import { selectionHaptic } from "@/utils/haptics";
import { ServingKey, useDietServingsStore } from "@/store/dietServingsStore";
import useDietPlanV1Query from "@/hooks/queries/useDietPlanV1Query";
import { useMemo } from "react";

const TOLERANCE = 0.001;

const servingKeyToMealField: Record<ServingKey, keyof IMeal | null> = {
  protein: "totalProtein",
  carbs: "totalCarbs",
  fat: "totalFats",
  veg: "totalVeggies",
  free: null,
};

interface DietItemContentProps {
  name: string;
  dietItem: IDietItem;
  mealId?: string;
  servingKey?: ServingKey;
}

const DietItemContent: React.FC<DietItemContentProps> = ({
  name,
  dietItem,
  mealId,
  servingKey,
}) => {
  const { layout, spacing } = useStyles();
  const toggleMealCategory = useDietServingsStore((s) => s.toggleMealCategory);
  const isEaten = useDietServingsStore((s) =>
    mealId && servingKey ? s.isCategoryEaten(mealId, servingKey) : false
  );
  const consumedForKey = useDietServingsStore((s) =>
    servingKey && servingKey !== "free" ? s[servingKey] : 0
  );

  const { data: plan } = useDietPlanV1Query();

  const dailyTarget = useMemo(() => {
    if (!servingKey || servingKey === "free") return 0;
    if (servingKey === "veg" && plan?.veggiesPerDay != null) return plan.veggiesPerDay;
    const field = servingKeyToMealField[servingKey];
    if (!field) return 0;
    const meals: IMeal[] = plan?.meals ?? [];
    return meals.reduce((acc: number, m: IMeal) => {
      const item = m[field] as IDietItem | undefined;
      return acc + (item?.quantity ?? 0);
    }, 0);
  }, [plan, servingKey]);

  const canMark = useMemo(() => {
    if (dailyTarget <= 0) return true;
    return consumedForKey + dietItem.quantity <= dailyTarget + TOLERANCE;
  }, [consumedForKey, dietItem.quantity, dailyTarget]);

  const apiFoodGroup = foodGroupToApiFoodGroupName(name) as FoodGroup;

  if (dietItem.quantity <= 0) return null;

  const canToggle = !!mealId && !!servingKey;
  const blocked = canToggle && !isEaten && !canMark;

  const handleToggle = () => {
    if (!canToggle) return;
    if (blocked) return;
    selectionHaptic();
    toggleMealCategory(mealId!, servingKey!, dietItem.quantity);
  };

  return (
    <Pressable
      onPress={canToggle ? handleToggle : undefined}
      style={[styles.wrap, isEaten && styles.eatenWrap]}
    >
      <View style={[spacing.gapDefault]}>
        <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
          <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
            <Text fontVariant="bold">{name}</Text>
            <GreenDotGenerator count={dietItem.quantity} />
          </View>
          {canToggle && (
            <View
              style={[
                styles.chip,
                isEaten ? styles.eatenChip : styles.markChip,
                blocked && styles.blockedChip,
              ]}
            >
              <Text
                fontVariant="semibold"
                fontSize={11}
                style={[
                  isEaten ? styles.eatenChipText : styles.markChipText,
                  blocked && styles.blockedChipText,
                ]}
              >
                {isEaten ? "✓ נאכל" : "סמן ארוחה"}
              </Text>
            </View>
          )}
        </View>
        <View style={{ minHeight: 45 }}>
          <FoodItemSelection
            customItems={dietItem.customItems}
            foodGroup={apiFoodGroup}
            servingAmount={dietItem.quantity}
            extraItems={dietItem.extraItems}
            struck={isEaten}
            preferredUnitIndex={plan?.unitDisplayMode === 2 ? 1 : 0}
          />
        </View>

        <AdditionalDietItemsModal
          name={name}
          foodGroup={apiFoodGroup}
          servingSize={dietItem.quantity}
          preferredUnitIndex={plan?.unitDisplayMode === 2 ? 1 : 0}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
    padding: 12,
    marginHorizontal: -4,
  },
  eatenWrap: {
    backgroundColor: "#EDFFEB",
    borderColor: "rgba(23, 178, 106, 0.28)",
  },
  chip: {
    width: 96,
    height: 26,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  eatenChip: {
    borderColor: "#A7ECC0",
    backgroundColor: "#D3F5DB",
  },
  eatenChipText: {
    color: "#1F5C3B",
  },
  markChip: {
    borderColor: "rgba(0, 0, 0, 0.12)",
    backgroundColor: "#FFFFFF",
  },
  markChipText: {
    color: "#4B5563",
  },
  blockedChip: {
    opacity: 0.4,
  },
  blockedChipText: {
    color: "#0F5E3B",
  },
});

export default DietItemContent;
