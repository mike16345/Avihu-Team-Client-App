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
}

const START_SLICE_INDEX = 0;
const END_SLICE_INDEX = 5;

const FoodItemSelection: FC<FoodItemSelectionProps> = ({
  foodGroup,
  servingAmount = 1,
  customItems = [],
}) => {
  const { center, wrap } = useLayoutStyles();
  const { data: items, isLoading } = useFoodGroupQuery(foodGroup);

  const formatted = useMemo(() => {
    if (!items) return "";
    const allItems = [...customItems, ...items];

    return allItems
      .slice(START_SLICE_INDEX, END_SLICE_INDEX)
      .map((item) => formatServingText(item.name, item.oneServing, servingAmount, 1, [], " ", true))
      .join(" | ");
  }, [items, customItems]);

  if (items == undefined || isLoading)
    return (
      <View style={[center]}>
        <SpinningIcon mode="light" />
      </View>
    );

  return (
    <TextInput multiline style={[wrap, styles.foodItemSelectionContainr]} editable={false}>
      {formatted}
    </TextInput>
  );
};

const styles = StyleSheet.create({
  foodItemSelectionContainr: { fontFamily: "Assistant-Regular", fontSize: 16, textAlign: "right" },
});

export default FoodItemSelection;
