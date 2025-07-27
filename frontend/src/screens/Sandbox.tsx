import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";
import CustomCalendar from "@/components/Calendar/CustomCalendar";

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();

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
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>

      <CustomCalendar onSelect={(date) => setDate(date)} />

      <Text>{date}</Text>
    </View>
  );
};

export default Sandbox;
