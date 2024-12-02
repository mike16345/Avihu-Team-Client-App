import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Platform, View } from "react-native";
import { Text } from "../ui/Text";

interface CurrentSetContainerProps {
  setNumber: number;
  maxReps?: number;
  minReps: number;
}

const CurrentSetContainer: React.FC<CurrentSetContainerProps> = ({
  minReps,
  setNumber,
  maxReps,
}) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  return (
    <View
      style={[
        { flexDirection: Platform.OS == `ios` ? `row-reverse` : `row` },
        layout.itemsCenter,
        layout.justifyStart,
        spacing.gapXxl,
        spacing.pdDefault,
        colors.backgroundSecondaryContainer,
        spacing.mgVerticalDefault,
        common.rounded,
        layout.flex1,
        layout.widthFull,
      ]}
    >
      <View
        style={[
          layout.itemsCenter,
          spacing.pdHorizontalDefault,
          layout.flexRowReverse,
          spacing.gapDefault,
        ]}
      >
        <Text style={[text.textBold, colors.textOnBackground]}>סט:</Text>
        <Text style={[fonts.lg, colors.textOnBackground]}>1</Text>
      </View>
      <View style={[layout.heightFull, common.borderXsm, colors.borderSecondary]}></View>
      <View style={[layout.itemsCenter, layout.flexRowReverse, spacing.gapDefault]}>
        <Text style={[text.textBold, colors.textOnBackground]}>מינ' חזרות:</Text>
        <Text style={[fonts.lg, colors.textOnBackground]}>8</Text>
      </View>
      <View style={[layout.itemsCenter, layout.flexRowReverse, spacing.gapDefault]}>
        <Text style={[text.textBold, colors.textOnBackground]}>מקס' חזרות:</Text>
        <Text style={[fonts.lg, colors.textOnBackground]}>10</Text>
      </View>
    </View>
  );
};

export default CurrentSetContainer;
