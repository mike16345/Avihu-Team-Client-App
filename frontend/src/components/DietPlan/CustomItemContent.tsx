import { ICustomMenuItem } from "@/interfaces/DietPlan";
import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import CustomItem from "./CustomItem";

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
        colors.background,
        common.rounded,
      ]}
    >
      <Text style={[text.textCenter, colors.textOnBackground, fonts.xl, text.textBold]}>
        בחר אחת מהאפשרויות הבאות
      </Text>
      <ScrollView contentContainerStyle={[layout.center, spacing.pdBottomBar]}>
        <View style={[layout.flexRow, layout.center, layout.wrap, spacing.gapDefault]}>
          {customInstructions.map(({ item, quantity }, i) => (
            <CustomItem key={i} foodGroup={foodGroup || ``} name={item} quantity={quantity} />
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
