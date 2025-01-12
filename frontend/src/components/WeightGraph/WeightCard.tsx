import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import useCardStyles from "@/styles/useCardStyles";
import { Text } from "../ui/Text";

interface CardProps {
  title: string;
  value: string | number;
  unit: string;
  operator?: string;
  isProgressing?: boolean;
}

const WeightCard: React.FC<CardProps> = ({ title, value, unit, operator, isProgressing }) => {
  const { text, fonts, layout, spacing, colors } = useStyles();
  const { weightCard } = useCardStyles();

  const textColor =
    isProgressing == undefined
      ? colors.textOnBackground
      : isProgressing
      ? colors.textSuccess
      : colors.textDanger;

  return (
    <View style={weightCard}>
      <Text style={[text.textBold, text.textRight, colors.textOnSecondaryContainer]}>{title}</Text>
      <View style={[layout.itemsCenter, layout.wrap, layout.flexRowReverse, spacing.gapSm]}>
        <Text style={[textColor, text.textBold, fonts.xl]}>
          {operator} {value}
        </Text>
        <Text style={[colors.textOnSecondaryContainer, fonts.default]}>{unit}</Text>
      </View>
    </View>
  );
};

export default WeightCard;
