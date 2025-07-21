import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";

import Checkbox from "@/components/ui/Checkbox";
import ProgressBar from "@/components/ui/ProgressBar";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();

  const [checked, setChecked] = useState(false);
  const [progress, setProgress] = useState(0);

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

      <ProgressBar value={progress} maxValue={100} />

      <Input
        placeholder="enter progress number to test bar"
        inputMode="numeric"
        onChangeText={(val) => setProgress(val)}
      />
      <Text>Max is 100</Text>

      <Badge children="just text" disabled />
      <Badge
        showDot
        children={
          <View style={[, layout.flexRow, layout.itemsCenter, layout.widthFull]}>
            <Text>Rendering custom children</Text>

            <View style={layout.alignSelfEnd}>
              <SecondaryButton
                size="sm"
                shadow={false}
                disabled
                leftIcon="arrowLeft"
                children="לצפיה"
              />
            </View>
          </View>
        }
        disabled
      />
      <Badge children="with dot" disabled showDot />
      <Badge
        children="with button | and dot | and pressable "
        onPress={() => console.log("i have been pressed")}
        showDot
        showButton
      />
      <Badge
        children="with custom button label "
        onPress={() => console.log("i have been pressed")}
        showDot
        showButton
        buttonLabel="press me father"
      />
      <Badge
        children="with custom button icon "
        onPress={() => console.log("i have been pressed")}
        showDot
        showButton
        buttonIcon="bell"
      />
    </View>
  );
};

export default Sandbox;
