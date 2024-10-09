import { ICustomItemInstructions } from "@/interfaces/DietPlan";
import React from "react";
import { Text, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

interface CustomInstructionsContainerProps {
  customInstructions: ICustomItemInstructions[];
  icon: JSX.Element;
  foodGroup?: string;
}

const CustomInstructionsContainer: React.FC<CustomInstructionsContainerProps> = ({
  customInstructions,
  icon,
  foodGroup,
}) => {
  const { layout, spacing, colors, text } = useStyles();

  return (
    <View style={[layout.itemsEnd, spacing.gapSm, spacing.pdVerticalXs]}>
      <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
        <Text style={colors.textOnSecondaryContainer}>{foodGroup} : </Text>
        {icon}
      </View>
      <View style={[layout.flexRowReverse, layout.wrap]}>
        {customInstructions.map((item, i) => (
          <Text key={i} style={[colors.textOnSecondaryContainer, text.textRight]}>
            {item.quantity} {item.item} {i + 1 !== customInstructions.length ? `/ ` : ``}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default CustomInstructionsContainer;
