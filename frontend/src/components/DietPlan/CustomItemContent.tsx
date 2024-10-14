import { ICustomMenuItem } from "@/interfaces/DietPlan";
import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MenuItemTicket from "./MenuItemTicket";
import NativeIcon from "../Icon/NativeIcon";
import Divider from "../ui/Divider";

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
          {/*  {customInstructions.map(({ item, quantity }, i) => (
            <MenuItemTicket quantity={quantity} name={item} foodGroup={foodGroup} key={i} />
          ))} */}
          {customInstructions.map(({ item, quantity }, i) => (
            <View
              key={i}
              style={[
                layout.itemsCenter,
                layout.flexRow,
                colors.backgroundSecondary,
                common.rounded,
                spacing.pdSm,
                layout.wrap,
                spacing.gapDefault,
                layout.widthFull,
              ]}
            >
              <View style={[colors.background, common.roundedSm]}>
                <NativeIcon
                  size={25}
                  style={[colors.textPrimary]}
                  library="MaterialCommunityIcons"
                  name={foodGroup == `חלבונים` ? `fish` : `baguette`}
                />
              </View>
              <View
                style={[
                  layout.flexRow,
                  layout.center,
                  spacing.gapDefault,
                  spacing.pdDefault,
                  layout.wrap,
                ]}
              >
                <Text style={[colors.textOnSecondary, text.textBold]}>{item}</Text>
                <View style={[colors.backgroundPrimary, { width: 3, height: 14 }]}></View>
                <Text style={[colors.textOnSecondary]}>
                  {quantity > 1 ? `${quantity} מנות` : `מנה אחת`}
                </Text>
              </View>
            </View>
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
