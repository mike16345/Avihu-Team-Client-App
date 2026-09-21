import { Image, StyleSheet } from "react-native";
import appIcon from "tenant-assets/runtime-logo.png";

const AppIcon = () => {
  return <Image source={appIcon} style={styles.logo} />;
};

const styles = StyleSheet.create({
  logo: {
    height: 54,
    width: 54,
    borderRadius: 17,
  },
});

export default AppIcon;
