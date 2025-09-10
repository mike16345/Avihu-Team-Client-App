import { View, Image, TouchableOpacity, BackHandler } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "../Icon/Icon";
import appIcon from "@assets/app-icon.png";
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
      <TouchableOpacity onPress={goBack}>
        <Icon name="chevronRightBig" />
      </TouchableOpacity>
      <Image source={appIcon} style={{ height: 54, width: 54 }} />
    </View>
  );
};

export default ChatHeader;
