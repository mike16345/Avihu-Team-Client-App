import { View } from "react-native";
import { FC } from "react";
import { FoodGroup } from "@/types/foodTypes";
import useFoodGroupQuery from "@/hooks/queries/useMenuItemsQuery";
import { Text } from "../ui/Text";
import { DietItemUnit } from "@/interfaces/DietPlan";
import { formatServingText } from "@/utils/utils";

interface FoodItemSelectionProps {
  foodGroup: FoodGroup;
}

const FoodItemSelection: FC<FoodItemSelectionProps> = ({ foodGroup }) => {
  const { data: items } = useFoodGroupQuery(foodGroup);

  if (!items) return null;

  const formatted = items
    .slice(0, 5)
    .map((item) => formatServingText(item.name, item.oneServing, 1))
    .join(" | ");

  return <Text>{formatted}</Text>;
};

export default FoodItemSelection;
