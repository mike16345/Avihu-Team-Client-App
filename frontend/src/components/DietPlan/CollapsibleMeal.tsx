import React, { FC, useMemo, useState } from "react";
import Collapsible from "../ui/Collapsible";
import { IDietItem, IMeal } from "@/interfaces/DietPlan";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import DietItemContent from "./DietItemContent";
import { foodGroupToName } from "@/utils/utils";
import { useDietPlanStore } from "@/store/useDietPlanStore";

interface CollapsibleMealProps {
  meal: IMeal;
  index: number;
}

const CollapsibleMeal: FC<CollapsibleMealProps> = ({ meal, index }) => {
  const setTotalCaloriesEaten = useDietPlanStore((state) => state.setTotalCaloriesEaten);
  const { layout, spacing } = useStyles();

  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [isEaten, setIsEaten] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((isCollapsed) => !isCollapsed);
  };

  const mealEatenIndicatorText = !isEaten ? "סיום ארוחה" : "ביטול סימון";

  const dietItems = useMemo(() => {
    return Object.keys(meal).filter((key) => key !== "_id");
  }, [meal]);

  return (
    <Collapsible
      trigger={`ארוחה ${index + 1}`}
      variant={isEaten ? "success" : "gray"}
      isCollapsed={isCollapsed}
      onCollapseChange={toggleCollapse}
    >
      <View style={[layout.flex1, layout.flexGrow, spacing.gapLg]}>
        {dietItems.map((dietItem, i) => {
          return (
            <DietItemContent
              key={`${dietItem}-${i}`}
              name={foodGroupToName(dietItem)}
              dietItem={meal[dietItem as keyof IMeal] as IDietItem}
            />
          );
        })}
        <PrimaryButton
          mode={isEaten ? "light" : "dark"}
          onPress={() => {
            setTotalCaloriesEaten(Math.random() * 1620);
            setIsEaten((isEaten) => !isEaten);
          }}
          block
        >
          {mealEatenIndicatorText}
        </PrimaryButton>
      </View>
    </Collapsible>
  );
};

export default CollapsibleMeal;
