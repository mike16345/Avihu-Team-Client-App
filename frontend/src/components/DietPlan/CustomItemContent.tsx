import { ICustomItem } from "@/interfaces/DietPlan";
import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import CustomItem from "./CustomItem";
import { Text } from "../ui/Text";

interface CustomItemContentProps {
  customInstructions: ICustomItem[];
  foodGroup?: string;
  quantity: number;
  unit: string;
  close: () => void;
}

const CustomItemContent: React.FC<CustomItemContentProps> = ({
  customInstructions,
  close,
  foodGroup,
  unit,
  quantity,
}) => {
  const { layout, spacing, colors, text, common, fonts } = useStyles();

  console.log("custom items", customInstructions);
  return (
    <View
      style={[
        spacing.gapMd,
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
          {customInstructions.map((item, i) => (
            <CustomItem
              key={i}
              foodGroup={foodGroup || ``}
              item={item}
              quantity={quantity}
              unit={unit}
            />
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
