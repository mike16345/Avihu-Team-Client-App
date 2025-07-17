import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import IconButton from "@/components/ui/buttons/IconButton";
import TextInput from "@/components/ui/TextInput";
import { useState } from "react";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();

  const [value, setValue] = useState(undefined);

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdDefault,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
      ]}
    >
      <Text style={[colors.textPrimary]}>{value || "type to change me"}</Text>

      <TextInput onChangeText={(val) => setValue(val)} placeholder="Michael touch me" />
    </View>
  );
};

export default Sandbox;
