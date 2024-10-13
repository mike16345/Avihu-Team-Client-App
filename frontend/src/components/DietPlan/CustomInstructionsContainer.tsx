import { ICustomMenuItem } from "@/interfaces/DietPlan";
import React from "react";
import { Text, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import MenuItemTicket from "./MenuItemTicket";
import { List } from "react-native-paper";

interface CustomInstructionsContainerProps {
  customInstructions: ICustomMenuItem[];
  foodGroup?: string;
}

const CustomInstructionsContainer: React.FC<CustomInstructionsContainerProps> = ({
  customInstructions,
  foodGroup,
}) => {
  const { layout, spacing, colors, text, common } = useStyles();
  console.log(customInstructions);

  return (
    <View style={[layout.itemsStart, spacing.gapSm, spacing.pdVerticalXs]}>
      <Text style={[colors.textPrimary]}>בחר אחד מה{foodGroup}</Text>
      <View style={[layout.flexRow, layout.wrap, spacing.gapDefault]}>
        {customInstructions.map((item, i) => (
          <MenuItemTicket foodGroup={foodGroup} quantity={item.quantity} name={item.item} key={i} />
        ))}
      </View>
    </View>
  );
};

export default CustomInstructionsContainer;
