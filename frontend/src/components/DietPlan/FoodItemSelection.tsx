import { FC } from "react";
import { FoodGroup } from "@/types/foodTypes";
import useFoodGroupQuery from "@/hooks/queries/MenuItems/useFoodGroupQuery";
import { Text } from "../ui/Text";
import { formatServingText } from "@/utils/utils";
import { View } from "react-native";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { useLayoutStyles } from "@/styles/useLayoutStyles";

interface FoodItemSelectionProps {
  foodGroup: FoodGroup;
}

const START_SLICE_INDEX = 0;
const END_SLICE_INDEX = 5;

const FoodItemSelection: FC<FoodItemSelectionProps> = ({ foodGroup }) => {
  const { center } = useLayoutStyles();
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

  return <Text>{formatted}</Text>;
};

export default FoodItemSelection;
