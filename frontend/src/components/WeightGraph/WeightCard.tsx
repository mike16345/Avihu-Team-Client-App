import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "react-native-paper";
import useCardStyles from "@/styles/useCardStyles";

interface CardProps {
  title: string;
  value: string | number;
  unit: string;
  valueStyle?: any;
}

const WeightCard: React.FC<CardProps> = ({ title, value, unit, valueStyle }) => {
  const { text, fonts, layout, spacing, colors } = useStyles();
  const { weightCard } = useCardStyles();

  return (
    <View style={weightCard}>
      <Text style={[text.textBold, text.textRight, colors.textOnSecondaryContainer]}>{title}</Text>
      <View style={[layout.itemsCenter, layout.wrap, layout.flexRowReverse, spacing.gapSm]}>
        <Text style={[colors.textOnSecondaryContainer, text.textBold, fonts.xl, valueStyle]}>
          {value}
        </Text>
        <Text style={[colors.textOnSecondaryContainer, fonts.default]}>{unit}</Text>
      </View>
    </View>
  );
};

export default WeightCard;
