import { ICustomMenuItem } from "@/interfaces/DietPlan";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Button } from "react-native-paper";
import BottomDrawer from "../ui/BottomDrawer";
import CustomItemContent from "./CustomItemContent";
import MenuItemTicket from "./MenuItemTicket";
import Divider from "../ui/Divider";

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
    <View style={[layout.itemsStart, spacing.gapSm, layout.widthFull, { paddingTop: 5 }]}>
      <Text style={[colors.textPrimary, text.textBold]}>{foodGroup}</Text>
      <Text style={[colors.textOnBackground]}>בחר אחת מהאפשרויות הבאות</Text>
      <ScrollView horizontal style={{ height: 20 }}>
        <View style={[layout.flexRow, layout.center, spacing.gapDefault, { paddingEnd: 70 }]}>
          {customInstructions.map(({ item, quantity }, i) => (
            <MenuItemTicket quantity={quantity} name={item} key={i} />
          ))}
        </View>
      </ScrollView>
      {/* <TouchableOpacity
        style={[colors.background, common.rounded, spacing.pdSm]}
        onPress={() => setOpenModal(true)}
      >
        <Text style={[colors.textOnBackground, fonts.md]}>צפה ב{foodGroup}</Text>
      </TouchableOpacity> */}

      {/* <BottomDrawer
        onClose={() => setOpenModal(false)}
        open={openModal}
        children={
          <CustomItemContent
            customInstructions={customInstructions}
            close={() => setOpenModal(false)}
          />
        }
      /> */}
    </View>
  );
};

export default CustomInstructionsContainer;
