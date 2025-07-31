import { View, useWindowDimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";
import CustomCalendar from "@/components/Calendar/CustomCalendar";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();
  const { width } = useWindowDimensions();

  const [date, setDate] = useState<string | undefined>();

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdXl,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
        layout.flexRow,
        layout.center,
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>
      <CustomCalendar onSelect={(date) => setDate(date)} />
      <Text>{date}</Text>
    </View>
  );
};

export default Sandbox;
