import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Text, View } from "react-native";

interface AmountContainerProps {
  amount?: number;
  title: string;
  variant?: `kg` | `gr`;
}

const AmountContainer: React.FC<AmountContainerProps> = ({ amount, title, variant }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  return (
    <View
      style={[
        colors.backgroundSecondaryContainer,
        common.rounded,
        layout.itemsEnd,
        spacing.pdDefault,
        { width: `47%` },
      ]}
    >
      <Text style={[fonts.lg, colors.textPrimary, text.textBold]}>{title}</Text>
      <View
        style={[layout.widthFull, layout.flexRowReverse, layout.itemsCenter, layout.justifyCenter]}
      >
        <Text
          style={[
            fonts.xxl,
            text.textBold,
            text.textCenter,
            colors.textOnSecondaryContainer,
            spacing.pdDefault,
          ]}
        >
          {amount}
        </Text>
        {variant && (
          <Text style={[colors.textPrimary, text.textBold]}>{variant == `gr` ? `גרם` : `ק"ג`}</Text>
        )}
      </View>
    </View>
  );
};

export default AmountContainer;
