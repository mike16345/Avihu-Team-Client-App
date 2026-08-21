import { FC, useMemo } from "react";
import { FoodGroup } from "@/types/foodTypes";
import useFoodGroupQuery from "@/hooks/queries/MenuItems/useFoodGroupQuery";
import { formatServingText } from "@/utils/utils";
import { StyleSheet, TextInput, View } from "react-native";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import { ICustomItem } from "@/interfaces/DietPlan";

interface FoodItemSelectionProps {
  foodGroup: FoodGroup;
  servingAmount: number;
  customItems?: ICustomItem[];
  extraItems?: string[];
  struck?: boolean;
}

const START_SLICE_INDEX = 0;
const END_SLICE_INDEX = 5;

const FoodItemSelection: FC<FoodItemSelectionProps> = ({
  foodGroup,
  servingAmount = 1,
  customItems = [],
  extraItems = [],
  struck = false,
}) => {
  const { center, wrap } = useLayoutStyles();
  const { data: items, isLoading } = useFoodGroupQuery(foodGroup);
  const hasCustomItems = customItems.length > 0;
  const hasExtraItems = extraItems.length > 0;
  const shouldShowGeneralItems = !hasCustomItems && !hasExtraItems;

  const formatted = useMemo(() => {
    const customFormatted = customItems.map((customItem) =>
      formatServingText(customItem.name, customItem.oneServing, servingAmount, 1, [], " ", true)
    );

    if (hasCustomItems && hasExtraItems) {
      return [...customFormatted, ...extraItems].join(" | ");
    }

    if (hasCustomItems) {
      return customFormatted.join(" | ");
    }

    if (hasExtraItems) {
      return extraItems.join(" | ");
    }

    if (!items) return "";

    return items
      .slice(START_SLICE_INDEX, END_SLICE_INDEX)
      .map((item) => formatServingText(item.name, item.oneServing, servingAmount, 1, [], " ", true))
      .join(" | ");
  }, [customItems, extraItems, hasCustomItems, hasExtraItems, items, servingAmount]);

  if (shouldShowGeneralItems && (items == undefined || isLoading))
    return (
      <View style={[center]}>
        <SpinningIcon mode="light" />
      </View>
    );

  return (
    <TextInput
      multiline
      style={[wrap, styles.foodItemSelectionContainr, struck && styles.struck]}
      editable={false}
    >
      {formatted}
    </TextInput>
  );
};

const styles = StyleSheet.create({
  foodItemSelectionContainr: {
    fontFamily: "Assistant-Regular",
    fontSize: 16,
    textAlign: "right",
  },
  struck: {
    textDecorationLine: "line-through",
    opacity: 0.55,
  },
});

export default FoodItemSelection;
