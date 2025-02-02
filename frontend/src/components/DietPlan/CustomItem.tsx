import React, { useMemo } from "react";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import { ICustomItem, IServingItem } from "@/interfaces/DietPlan";
import { servingTypeToString } from "@/utils/utils";

interface CustomItemProps {
  foodGroup: string;
  item: string | ICustomItem;
  quantity: number;
}

const CustomItem: React.FC<CustomItemProps> = ({ item, quantity }) => {
  const { layout, fonts, spacing, colors, text, common } = useStyles();

  const isCustomItem = typeof item !== "string";
  const units = isCustomItem ? Object.keys(item.oneServing).filter((i) => i !== "_id") : [];

  const measurements = useMemo(() => {
    return (
      <View
        style={[
          spacing.gapSm,
          layout.wrap,
          layout.flexRow,
          layout.itemsCenter,
          layout.justifyAround,
          spacing.pdXs,
        ]}
      >
        {units.map((unit, i) => {
          if (unit == "_id") return;
          const typedKey = unit as keyof IServingItem;
          const totalQuantity = isCustomItem ? item.oneServing[typedKey]! * quantity : null;

          return (
            <View style={[layout.flexRow, spacing.gapDefault]}>
              <Text key={unit} style={[colors.textOnBackground, text.textRight, fonts.md]}>
                {servingTypeToString(unit)}: {totalQuantity}
              </Text>
              {i !== units.length - 1 && isCustomItem && (
                <View style={[colors.borderPrimary, { borderLeftWidth: 1 }]}></View>
              )}
            </View>
          );
        })}
      </View>
    );
  }, [units]);

  return (
    <View
      style={[spacing.pdXs, spacing.gapXs, common.rounded, colors.backgroundSecondaryContainer]}
    >
      <View
        style={[colors.borderPrimary, isCustomItem && { borderBottomWidth: 2 }, layout.widthFull]}
      >
        <Text style={[colors.textOnBackground, text.textRight, spacing.pdXs, text.textBold]}>
          {isCustomItem ? item.name : item}
        </Text>
      </View>
      <>{measurements}</>
    </View>
  );
};

export default CustomItem;
