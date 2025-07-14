import { ICustomItem } from "@/interfaces/DietPlan";
import useStyles from "@/styles/useGlobalStyles";
import React, { useMemo } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import CustomItem from "./CustomItem";
import { Text } from "../ui/Text";

interface CustomItemContentProps {
  customInstructions: ICustomItem[];
  extraItems: string[];
  foodGroup?: string;
  quantity: number;
}

const CustomItemContent: React.FC<CustomItemContentProps> = ({
  customInstructions,
  foodGroup,
  quantity,
  extraItems,
}) => {
  const { layout, spacing, colors, text, common, fonts } = useStyles();

  const items = useMemo<(string | ICustomItem)[]>(() => {
    const combinedItems = [...customInstructions, ...extraItems];
    return combinedItems;
  }, [extraItems, customInstructions]);

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
      <Text style={[text.textCenter, colors.textOnBackground, fonts.lg, text.textBold]}>
        בחר אחת מהאפשרויות הבאות
      </Text>
      <ScrollView contentContainerStyle={[layout.center, spacing.pdBottomBar]}>
        <View style={[layout.flexRow, layout.center, layout.wrap, spacing.gapDefault]}>
          {items.map((item, i) => (
            <View style={{ width: "48%" }}>
              <CustomItem key={i} foodGroup={foodGroup || ``} item={item} quantity={quantity} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default CustomItemContent;
