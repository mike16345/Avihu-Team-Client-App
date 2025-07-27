import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import UploadDrawer from "@/components/ui/UploadDrawer";

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();

  const [visible, setVisible] = useState(false);

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

      <UploadDrawer trigger={<PrimaryButton children="Open Modal" icon="like" block />} />
    </View>
  );
};

export default Sandbox;
