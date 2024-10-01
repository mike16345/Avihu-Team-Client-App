import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Text, View } from "react-native";

interface FreeCaloriesContainerProps {
  calorieAmount?: number;
}

const FreeCaloriesContainer: React.FC<FreeCaloriesContainerProps> = ({ calorieAmount }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  return (
    <View
      style={[
        colors.backgroundSecondaryContainer,
        common.rounded,
        layout.itemsEnd,
        spacing.pdDefault,
        { width: `48%` },
      ]}
    >
      <Text style={[fonts.lg, colors.textPrimary, text.textBold]}>קלוריות חופשיות</Text>
      <Text
        style={[
          fonts.xxl,
          text.textBold,
          text.textCenter,
          layout.widthFull,
          colors.textOnSecondaryContainer,
          spacing.pdDefault,
        ]}
      >
        {calorieAmount}
      </Text>
    </View>
  );
};

export default FreeCaloriesContainer;
