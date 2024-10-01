import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Text, View } from "react-native";

const TipsAndCaloriesContainer = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  return (
    <View style={[spacing.pdDefault, layout.itemsEnd]}>
      <View>
        <Text style={[colors.textPrimary, fonts.lg]}>הערות</Text>
      </View>
      <Text>קלוריות חופשיות 20</Text>
    </View>
  );
};

export default TipsAndCaloriesContainer;
