import { FC, useMemo, useState } from "react";
import Collapsible from "../ui/Collapsible";
import { IDietItem, IMeal } from "@/interfaces/DietPlan";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import DietItemContent from "./DietItemContent";
import { foodGroupToName } from "@/utils/utils";
import { useRecordMeal } from "@/hooks/useRecordMeal";

interface CollapsibleMealProps {
  meal: IMeal;
  index: number;
}

const CollapsibleMeal: FC<CollapsibleMealProps> = ({ meal, index }) => {
  const { session, recordMeal, cancelMeal } = useRecordMeal();
  const { layout, spacing } = useStyles();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const isEaten = useMemo(() => {
    if (!session?.meals) return false;

    const isEaten = session?.meals.find((m) => m.id == meal._id);

    return !!isEaten;
  }, [session?.meals]);

  const handleMealPress = () => {
    if (isEaten) {
      cancelMeal(meal._id);
    } else {
      recordMeal(meal, index);
    }
  };

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
        <PrimaryButton mode={isEaten ? "light" : "dark"} onPress={handleMealPress} block>
          {mealEatenIndicatorText}
        </PrimaryButton>
      </View>
    </Collapsible>
  );
};

export default CollapsibleMeal;
