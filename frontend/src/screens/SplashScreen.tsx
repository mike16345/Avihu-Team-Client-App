import { View, Image, StyleSheet } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import appIcon from "@assets/app-icon.png";

const SplashScreen = () => {
  const { colors, layout } = useStyles();

  return (
    <View style={[layout.flex1, layout.center, colors.background]}>
      <Image source={appIcon} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  logo: { height: 108, width: 100 },
});

export default SplashScreen;
