import { Image, StyleSheet, View } from "react-native";
import appIcon from "tenant-assets/runtime-logo.png";

const AppIcon = () => {
  return (
    <View style={styles.wrapper}>
      <Image source={appIcon} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    height: 64,
    width: 60,
  },
});

export default AppIcon;
