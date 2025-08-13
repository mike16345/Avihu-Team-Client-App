import React, { FC } from "react";
import Collapsible from "../ui/Collapsible";
import { Text } from "../ui/Text";
import { IMeal } from "@/interfaces/DietPlan";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import GreenDotGenerator from "../ui/GreenDotGenerator";

interface CollapsibleMealProps {
  meal: IMeal;
  index: number;
}

const CollapsibleMeal: FC<CollapsibleMealProps> = ({ meal, index }) => {
  const { layout, spacing } = useStyles();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleCollapse = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  return (
    <Collapsible
      trigger={`ארוחה ${index + 1}`}
      isCollapsed={isOpen}
      onCollapseChange={toggleCollapse}
    >
      <View>
        <View>
          <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
            <Text fontVariant="bold">חלבונים</Text>
            <GreenDotGenerator count={meal.totalProtein.quantity} />
          </View>
          <Text>
            2 ביצים 80 גרם | טונה 200 גרם | עדשים 350 גרם | קינואה 450 גרם | סינטה 150 גרם{" "}
          </Text>
        </View>
      </View>
    </Collapsible>
  );
};

export default CollapsibleMeal;
