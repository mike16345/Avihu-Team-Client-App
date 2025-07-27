import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Collapsible from "@/components/ui/Collapsible";
import { useState } from "react";
import Icon from "@/components/Icon/Icon";
import CustomCalendar from "@/components/Calendar/CustomCalendar";

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdXl,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>

      <CustomCalendar />
    </View>
  );
};

export default Sandbox;
