import React, { FC } from "react";
import Collapsible from "../ui/Collapsible";
import { Text } from "../ui/Text";
import { IMeal } from "@/interfaces/DietPlan";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

interface CollapsibleMealProps {
  meal: IMeal;
  index: number;
}

const CollapsibleMeal: FC<CollapsibleMealProps> = ({ meal, index }) => {
    const {} = useStyles()
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
      <View style={[]}>
        <Text>חלבונים </Text> 
      </View>
    </Collapsible>
  );
};

export default CollapsibleMeal;
