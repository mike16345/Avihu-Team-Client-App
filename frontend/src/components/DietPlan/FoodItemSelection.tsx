import { FC } from "react";
import { FoodGroup } from "@/types/foodTypes";
import useFoodGroupQuery from "@/hooks/queries/useMenuItemsQuery";
import { Text } from "../ui/Text";
import { DietItemUnit } from "@/interfaces/DietPlan";

interface FoodItemSelectionProps {
  foodGroup: FoodGroup;
}

const FoodItemSelection: FC<FoodItemSelectionProps> = ({ foodGroup }) => {
  const { data: items } = useFoodGroupQuery(foodGroup);

  if (!items) return null;

  const unitLabels: Record<DietItemUnit, string> = {
    grams: "גרם",
    spoons: "כפות",
    pieces: "יחידות",
    scoops: "סקופים",
    cups: "כוסות",
  };

  const formatted = items
    .slice(0, 5)
    .map((item) => {
      const { name, oneServing } = item;

      const unitEntry = Object.entries(oneServing).find(
        ([, value]) => value !== undefined && value !== null
      );

      if (!unitEntry) return name;

      const [unitKey, value] = unitEntry as [DietItemUnit, number];
      return `${name} ${value} ${unitLabels[unitKey]}`;
    })
    .join(" | ");

  return <Text>{formatted}</Text>;
};

export default FoodItemSelection;
