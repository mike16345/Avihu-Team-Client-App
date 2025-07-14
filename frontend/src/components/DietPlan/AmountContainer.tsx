import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { View } from "react-native";
import { Text } from "../ui/Text";

interface AmountContainerProps {
  amount?: number;
  title: string;
  variant?: string;
}

const AmountContainer: React.FC<AmountContainerProps> = ({ amount, title, variant = `יח'` }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  return (
    <View
      style={[
        colors.backgroundSecondaryContainer,
        common.rounded,
        layout.itemsEnd,
        spacing.pdDefault,
        layout.flex1,
        spacing.gapDefault,
        { width: 135 },
      ]}
    >
      <Text style={[fonts.md, colors.textPrimary, text.textBold, text.textRight]}>{title}</Text>
      <View
        style={[
          layout.widthFull,
          layout.flex1,
          layout.flexRowReverse,
          layout.center,
          spacing.gapSm,
        ]}
      >
        <Text style={[fonts.lg, text.textBold, text.textCenter, colors.textOnSecondaryContainer]}>
          {amount}
        </Text>
        {variant && (
          <Text style={[colors.textOnBackground, text.textBold, { opacity: 0.8 }]}>{variant}</Text>
        )}
      </View>
    </View>
  );
};

export default AmountContainer;
