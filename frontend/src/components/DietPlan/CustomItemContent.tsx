import { ICustomMenuItem } from "@/interfaces/DietPlan";
import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MenuItemTicket from "./MenuItemTicket";

interface CustomItemContentProps {
  customInstructions: ICustomMenuItem[];
  foodGroup?: string;
  close: () => void;
}

const CustomItemContent: React.FC<CustomItemContentProps> = ({
  customInstructions,
  close,
  foodGroup,
}) => {
  const { layout, spacing, colors, text, common, fonts } = useStyles();

  return (
    <View
      style={[
        spacing.gapXxl,
        layout.justifyAround,
        layout.heightFull,
        spacing.pdDefault,
        colors.backdrop,
        common.rounded,
      ]}
    >
      <Text style={[text.textCenter, colors.textOnBackground, fonts.xl, text.textBold]}>
        בחר אחת מהאפשרויות הבאות
      </Text>
      <ScrollView contentContainerStyle={[layout.center, layout.flex1]}>
        <View style={[layout.flexRow, layout.center, layout.wrap, spacing.gapLg]}>
          {customInstructions.map(({ item, quantity }, i) => (
            <MenuItemTicket quantity={quantity} name={item} foodGroup={foodGroup} key={i} />
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[
          layout.widthFull,
          layout.center,
          colors.backgroundPrimary,
          common.rounded,
          spacing.pdVerticalDefault,
        ]}
        onPress={close}
      >
        <Text style={[colors.textOnBackground, fonts.lg, text.textBold]}>חזרה</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomItemContent;
