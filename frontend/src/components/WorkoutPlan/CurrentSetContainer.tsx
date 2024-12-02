import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { View } from "react-native";
import { Text } from "../ui/Text";

const CurrentSetContainer = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  return (
    <View
      style={[
        layout.flexDirectionByPlatform,
        layout.itemsCenter,
        layout.justifyAround,
        colors.backgroundSecondaryContainer,
        spacing.pdDefault,
        common.rounded,
        layout.flex1,
        layout.widthFull,
      ]}
    >
      <View style={[layout.itemsCenter]}>
        <Text style={[text.textBold]}>סט:</Text>
        <Text style={[fonts.lg]}>1</Text>
      </View>
      <View style={[layout.itemsCenter]}>
        <Text style={[text.textBold]}>סט:</Text>
        <Text style={[fonts.lg]}>1</Text>
      </View>
      <View style={[layout.itemsCenter]}>
        <Text style={[text.textBold]}>סט:</Text>
        <Text style={[fonts.lg]}>1</Text>
      </View>
    </View>
  );
};

export default CurrentSetContainer;
