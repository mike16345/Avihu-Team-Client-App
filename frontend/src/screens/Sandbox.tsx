import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import UploadDrawer from "@/components/ui/UploadDrawer";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();

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
      <UploadDrawer trigger={<PrimaryButton children="Open Modal" icon="like" block />} />
    </View>
  );
};

export default Sandbox;
