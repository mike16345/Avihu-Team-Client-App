import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";

import Checkbox from "@/components/ui/Checkbox";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();

  const [checked, setChecked] = useState(false);

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdXl,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
        { direction: "rtl" },
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>

      <Checkbox value={checked} onCheck={(val) => setChecked(val)} label="תלחץ עליי" />
      <Checkbox
        value={checked}
        onCheck={(val) => setChecked(val)}
        label="My label is on the other side"
        direction="ltr"
      />
    </View>
  );
};

export default Sandbox;
