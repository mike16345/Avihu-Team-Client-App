import { FC, useMemo, useState } from "react";
import Collapsible from "../ui/Collapsible";
import { IDietItem, IMeal } from "@/interfaces/DietPlan";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import DietItemContent from "./DietItemContent";
import { foodGroupToName } from "@/utils/utils";
import { useRecordMeal } from "@/hooks/useRecordMeal";
import { Text } from "../ui/Text";
import Icon from "../Icon/Icon";
import { selectionHaptic } from "@/utils/haptics";

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

    selectionHaptic();
  };

  const toggleCollapse = () => {
    setIsCollapsed((isCollapsed) => !isCollapsed);
  };

  const mealEatenIndicatorText = useMemo(
    () => (!isEaten ? "סיום ארוחה" : "ביטול סימון"),
    [isEaten]
  );

  const dietItems = useMemo(() => {
    return Object.keys(meal).filter((key) => key !== "_id");
  }, [meal]);

  return (
    <Collapsible
      trigger={
        <View
          style={[
            layout.flexRow,
            layout.itemsCenter,
            layout.justifyBetween,
            { paddingHorizontal: 18, paddingVertical: 14 },
          ]}
        >
          <Text fontSize={16} fontVariant="semibold">
            ארוחה {index + 1}
          </Text>
          <Icon name="chevronDown" rotation={isCollapsed ? 0 : 180} />
        </View>
      }
      variant={isEaten ? "success" : "gray"}
      isCollapsed={isCollapsed}
      onCollapseChange={toggleCollapse}
      style={{ padding: 0 }}
    >
      <View
        style={[
          layout.flex1,
          layout.flexGrow,
          spacing.gapLg,
          { paddingTop: 12, paddingHorizontal: 18 },
        ]}
      >
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
          style={{ marginBottom: 20 }}
          mode={isEaten ? "light" : "dark"}
          onPress={handleMealPress}
          block
        >
          {mealEatenIndicatorText}
        </PrimaryButton>
      </View>
    </Collapsible>
  );
};

export default CollapsibleMeal;
