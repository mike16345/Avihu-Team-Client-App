import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import useLogout from "@/hooks/useLogout";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();
  const { handleLogout } = useLogout();

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
      <PrimaryButton onPress={handleLogout} block>
        Log out
      </PrimaryButton>
    </View>
  );
};

export default Sandbox;
