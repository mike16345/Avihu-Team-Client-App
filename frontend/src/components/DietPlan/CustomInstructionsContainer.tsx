import { ICustomMenuItem } from "@/interfaces/DietPlan";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Button } from "react-native-paper";
import BottomDrawer from "../ui/BottomDrawer";
import CustomItemContent from "./CustomItemContent";
import NativeIcon from "../Icon/NativeIcon";

interface CustomInstructionsContainerProps {
  customInstructions: ICustomMenuItem[];
  foodGroup?: string;
}

const CustomInstructionsContainer: React.FC<CustomInstructionsContainerProps> = ({
  customInstructions,
  foodGroup,
}) => {
  const { layout, spacing, colors, common, fonts, text } = useStyles();
  const [openModal, setOpenModal] = useState(false);

  return (
    <View style={[layout.itemsStart, spacing.gapSm, spacing.pdVerticalXs]}>
      <TouchableOpacity
        style={[
          colors.background,
          layout.flexRow,
          layout.center,
          spacing.gapSm,
          common.rounded,
          spacing.pdSm,
        ]}
        onPress={() => setOpenModal(true)}
      >
        <NativeIcon
          size={18}
          style={[colors.textPrimary]}
          library="MaterialCommunityIcons"
          name={foodGroup == `חלבונים` ? `fish` : `baguette`}
        />
        <Text style={[colors.textOnBackground, fonts.md]}>צפה ב{foodGroup}</Text>
      </TouchableOpacity> */}

      {/* <BottomDrawer
        onClose={() => setOpenModal(false)}
        open={openModal}
        children={
          <CustomItemContent
            customInstructions={customInstructions}
            foodGroup={foodGroup}
            close={() => setOpenModal(false)}
          />
        }
      /> */}
    </View>
  );
};

export default CustomInstructionsContainer;
