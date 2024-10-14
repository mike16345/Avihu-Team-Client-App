import { ICustomMenuItem } from "@/interfaces/DietPlan";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Button } from "react-native-paper";
import BottomDrawer from "../ui/BottomDrawer";
import CustomItemContent from "./CustomItemContent";

interface CustomInstructionsContainerProps {
  customInstructions: ICustomMenuItem[];
  foodGroup?: string;
}

const CustomInstructionsContainer: React.FC<CustomInstructionsContainerProps> = ({
  customInstructions,
  foodGroup,
}) => {
  const { layout, spacing, colors, common, fonts } = useStyles();
  const [openModal, setOpenModal] = useState(false);

  return (
    <View style={[layout.itemsStart, spacing.gapSm, spacing.pdVerticalXs]}>
      <TouchableOpacity
        style={[colors.background, common.rounded, spacing.pdSm]}
        onPress={() => setOpenModal(true)}
      >
        <Text style={[colors.textOnBackground, fonts.md]}>צפה ב{foodGroup}</Text>
      </TouchableOpacity>

      <BottomDrawer
        onClose={() => setOpenModal(false)}
        open={openModal}
        children={
          <CustomItemContent
            customInstructions={customInstructions}
            close={() => setOpenModal(false)}
          />
        }
      />
    </View>
  );
};

export default CustomInstructionsContainer;
