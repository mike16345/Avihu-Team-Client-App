import { ICustomMenuItem } from "@/interfaces/DietPlan";
import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MenuItemTicket from "./MenuItemTicket";

interface CustomItemContentProps {
  customInstructions: ICustomMenuItem[];
  close: () => void;
}

const CustomItemContent: React.FC<CustomItemContentProps> = ({ customInstructions, close }) => {
  const { layout, spacing, colors, text, common, fonts } = useStyles();

  return (
    <View
      style={[
        spacing.gapXxl,
        layout.justifyAround,
        layout.heightFull,
        spacing.pdDefault,
        colors.backdrop,
      ]}
    >
      <Text style={[text.textCenter, colors.textOnBackground, fonts.xl, text.textBold]}>
        בחר אחת מהאפשרויות הבאות
      </Text>

      <View style={[layout.flexRow, layout.center, layout.wrap, spacing.gapXl]}>
        {customInstructions.map(({ item, quantity }, i) => (
          <MenuItemTicket quantity={quantity} name={item} key={i} />
        ))}
      </View>
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
