import { View, Image, TouchableOpacity, BackHandler, StyleSheet } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "../Icon/Icon";
import appIcon from "@assets/app-logo.png";
import { RootStackParamListNavigationProp } from "@/types/navigatorTypes";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

const ChatHeader = () => {
  const { layout, colors, spacing } = useStyles();
  const navigation = useNavigation<RootStackParamListNavigationProp>();

  const goBack = () => {
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", goBack);

    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <View
      style={[
        colors.backgroundSecondary,
        layout.flexRow,
        layout.itemsCenter,
        spacing.pdDefault,
        spacing.gapDefault,
        colors.outline,
        spacing.pdStatusBar,
        { borderBottomWidth: 1 },
      ]}
    >
      <TouchableOpacity
        style={[layout.flexRow, spacing.gapDefault, layout.center, styles.shadow]}
        onPress={goBack}
      >
        <Icon name="chevronRightBig" />
        <Image source={appIcon} style={styles.logo} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    height: 54,
    width: 54,
    borderRadius: 17,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: -4,
      height: 8,
    },
    shadowOpacity: 0.2, // Increased slightly so the shadow remains visible as it stretches
    shadowRadius: 11,

    // Android Shadow Property
    elevation: 20,
  },
});

export default ChatHeader;
