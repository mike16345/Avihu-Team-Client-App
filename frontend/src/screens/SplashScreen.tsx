import { View, Image, StyleSheet } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import appIcon from "@assets/app-icon.png";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";

const SplashScreen = () => {
  const { colors, layout, spacing } = useStyles();

  return (
    <View style={[layout.flex1, layout.center, colors.background, spacing.gapLg]}>
      <Image source={appIcon} style={styles.logo} />

      <SpinningIcon mode="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  logo: { height: 108, width: 100 },
});

export default SplashScreen;
