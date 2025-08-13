import React, { FC, useMemo } from "react";
import Collapsible from "../ui/Collapsible";
import { IDietItem, IMeal } from "@/interfaces/DietPlan";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import DietItemContent from "./DietItemContent";
import { foodGroupToName } from "@/utils/utils";

interface CollapsibleMealProps {
  meal: IMeal;
  index: number;
}

const CollapsibleMeal: FC<CollapsibleMealProps> = ({ meal, index }) => {
  const { layout, spacing } = useStyles();
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const toggleCollapse = () => {
    setIsCollapsed((isCollapsed) => !isCollapsed);
  };

  const dietItems = useMemo(() => {
    return Object.keys(meal).filter((key) => key !== "_id");
  }, [meal]);

  return (
    <Collapsible
      trigger={`ארוחה ${index + 1}`}
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
        <PrimaryButton block>סיום ארוחה</PrimaryButton>
      </View>
    </Collapsible>
  );
};

export default CollapsibleMeal;
