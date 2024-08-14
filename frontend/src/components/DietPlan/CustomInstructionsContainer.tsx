import { ICustomItemInstructions } from "@/interfaces/DietPlan";
import React from "react";
import { Text, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

interface CustomInstructionsContainerProps {
  customInstructions: ICustomItemInstructions[];
  icon: JSX.Element;
  foodGroup: string;
}

const CustomInstructionsContainer: React.FC<CustomInstructionsContainerProps> = ({
  customInstructions,
  icon,
  foodGroup,
}) => {

  const {layout, spacing, colors,}=useStyles()

  return (
    <View>
      <View style={[
        layout.flexRow,
        layout.itemsCenter,
        spacing.gapSm,
        spacing.pdVerticalXs,
      ]}>
        {icon}
        <Text style={colors.textInverseOnSurface}>{foodGroup}:</Text>
      </View>
      <View style={[
        layout.flexRow,
        layout.justifyCenter,
        layout.widthFull,
        spacing.pdXs,
        spacing.gapSm
      ]}>
        {customInstructions.map((item, i) => (
          <Text key={i} style={colors.textInverseOnSurface}>
            {item.item}: {item.quantity} {i + 1 !== customInstructions.length ? `/` : ``}{" "}
          </Text>
        ))}
      </View>
    </View>
  );
};



export default CustomInstructionsContainer;
