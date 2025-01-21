import React from "react";
import { Platform, View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import { ICustomItem } from "@/interfaces/DietPlan";

interface CustomItemProps {
  foodGroup: string;
  item: string | ICustomItem;
  unit: string;
  quantity: number;
}

const CustomItem: React.FC<CustomItemProps> = ({ item, unit, quantity, foodGroup }) => {
  const { layout, spacing, colors, text, common } = useStyles();
  const isGrams = unit === "grams";
  const unitName = isGrams ? "גרם" : "כפות";

  const isCustomItem = typeof item !== "string";

  const totalQuantity = isCustomItem
    ? isGrams
      ? item.oneServing.grams * quantity
      : item.oneServing.spoons * quantity
    : null;

  return (
    <View
      style={[
        layout.flexDirectionByPlatform,
        colors.backgroundSecondaryContainer,
        common.rounded,
        spacing.pdSm,
        layout.wrap,
        layout.widthFull,
        layout.itemsCenter,
        spacing.gapDefault,
      ]}
    >
      <View style={[spacing.pdXs, layout.center]}>
        <NativeIcon
          size={25}
          style={colors.textPrimary}
          library="MaterialCommunityIcons"
          name={foodGroup === `חלבונים` ? `fish` : `baguette`}
        />
      </View>

      <View
        style={[
          layout.flexDirectionByPlatform,
          layout.justifyBetween,
          layout.itemsCenter,
          layout.flex1,
          spacing.gapDefault,
        ]}
      >
        <Text
          style={[
            colors.textOnBackground,
            text.textBold,
            layout.flex1,
            { textAlign: Platform.OS === `android` ? `right` : `left` },
          ]}
          numberOfLines={1}
        >
          {isCustomItem ? item.name : item}
        </Text>
        {isCustomItem && (
          <>
            <View style={[colors.backgroundSecondary, { width: 3, height: 14 }]} />
            <Text style={[colors.textOnBackground, text.textBold, { flexShrink: 1 }]}>
              {`${totalQuantity} ${unitName}`}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

export default CustomItem;
