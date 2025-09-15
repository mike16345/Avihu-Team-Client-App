import { FC } from "react";
import { FoodGroup } from "@/types/foodTypes";
import useFoodGroupQuery from "@/hooks/queries/MenuItems/useFoodGroupQuery";
import { formatServingText } from "@/utils/utils";
import { StyleSheet, TextInput, View } from "react-native";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { useLayoutStyles } from "@/styles/useLayoutStyles";

interface FoodItemSelectionProps {
  foodGroup: FoodGroup;
}

const START_SLICE_INDEX = 0;
const END_SLICE_INDEX = 5;

const FoodItemSelection: FC<FoodItemSelectionProps> = ({ foodGroup }) => {
  const { center, wrap } = useLayoutStyles();
  const { data: items, isLoading } = useFoodGroupQuery(foodGroup);

  if (items == undefined || isLoading)
    return (
      <View style={[center]}>
        <SpinningIcon mode="light" />
      </View>
    );

  const formatted = items
    .slice(START_SLICE_INDEX, END_SLICE_INDEX)
    .map((item) => formatServingText(item.name, item.oneServing, 1))
    .join(" | ");

  return (
    <TextInput multiline style={[wrap, styles.foodItemSelectionContainr]} editable={false}>
      {formatted}
    </TextInput>
  );
};

const styles = StyleSheet.create({
  foodItemSelectionContainr: { fontSize: 16, fontFamily: "Assistant", textAlign: "right" },
});

export default FoodItemSelection;
