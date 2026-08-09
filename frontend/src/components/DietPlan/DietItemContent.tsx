import { Pressable, StyleSheet, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import GreenDotGenerator from "../ui/GreenDotGenerator";
import { Text } from "../ui/Text";
import { IDietItem } from "@/interfaces/DietPlan";
import FoodItemSelection from "./FoodItemSelection";
import { foodGroupToApiFoodGroupName } from "@/utils/utils";
import { FoodGroup } from "@/types/foodTypes";
import AdditionalDietItemsModal from "./AdditionalDietItemsModal";
import { selectionHaptic } from "@/utils/haptics";
import { ServingKey, useDietServingsStore } from "@/store/dietServingsStore";

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

  const apiFoodGroup = foodGroupToApiFoodGroupName(name) as FoodGroup;

  if (dietItem.quantity <= 0) return null;

  const canToggle = !!mealId && !!servingKey;

  const handleToggle = () => {
    if (!canToggle) return;
    selectionHaptic();
    toggleMealCategory(mealId!, servingKey!, dietItem.quantity);
  };

  const Wrapper: any = canToggle ? Pressable : View;
  const wrapperProps = canToggle ? { onPress: handleToggle } : {};

  return (
    <Wrapper {...wrapperProps} style={[isEaten && styles.eatenWrap]}>
      <View style={[spacing.gapDefault]}>
        <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
          <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
            <Text fontVariant="bold">{name}</Text>
            <GreenDotGenerator count={dietItem.quantity} />
          </View>
          {canToggle && (
            <View style={[styles.chip, isEaten ? styles.eatenChip : styles.markChip]}>
              <Text
                fontVariant="semibold"
                fontSize={11}
                style={isEaten ? styles.eatenChipText : styles.markChipText}
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
          />
        </View>

        <AdditionalDietItemsModal
          name={name}
          foodGroup={apiFoodGroup}
          servingSize={dietItem.quantity}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  eatenWrap: {
    backgroundColor: "#EDFFEB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(23, 178, 106, 0.28)",
    padding: 12,
    marginHorizontal: -4,
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
});

export default DietItemContent;
