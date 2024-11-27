import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { View } from "react-native";
import { Text } from "../ui/Text";

interface AmountContainerProps {
  amount?: number;
  title: string;
  variant?: `kg` | "cal" | `gr` | `unit`;
}

const AmountContainer: React.FC<AmountContainerProps> = ({ amount, title, variant }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const label =
    variant == `gr` ? `גרם` : variant == "kg" ? `ק"ג` : variant === `unit` ? `יח'` : "קל";
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
        {variant && <Text style={[colors.textPrimary, text.textBold]}>{label}</Text>}
      </View>
    </View>
  );
};

export default AmountContainer;
