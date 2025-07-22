import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Windows from "./Windows";

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();

  const windowItems = [
    <View style={[layout.center, layout.flex1, common.borderDefault]}>
      <Text>Window 1</Text>
    </View>,
    <View style={[layout.center, layout.flex1, common.borderDefault]}>
      <Text>Window 2</Text>
    </View>,
    <View style={[layout.center, layout.flex1, common.borderDefault]}>
      <Text>Window 3</Text>
    </View>,
  ];

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

      <Windows windowItems={windowItems} />
    </View>
  );
};

export default Sandbox;
