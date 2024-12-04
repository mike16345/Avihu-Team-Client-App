import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import RightDrawer from "../ui/RightDrawer";
import { Text } from "../ui/Text";
import UserInfoContainer from "./UserInfoContainer";
import { Button } from "react-native-paper";
import { useUserDrawer } from "@/store/userDrawerStore";
import { useUserStore } from "@/store/userStore";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "@/types/navigatorTypes";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const UserDrawer = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { openUserDrawer, setOpenUserDrawer } = useUserDrawer();
  const { setCurrentUser } = useUserStore();
  const sessionStorage = useAsyncStorage("sessionToken");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const logUserOut = () => {
    setCurrentUser(null);
    sessionStorage.removeItem();
    navigation.navigate("LoginScreen");
  };

  return (
    <RightDrawer
      open={openUserDrawer}
      onClose={() => setOpenUserDrawer(false)}
      children={
        <View
          style={[
            layout.sizeFull,
            spacing.pdHorizontalSm,
            spacing.pdStatusBar,
            layout.justifyBetween,
          ]}
        >
          <Text style={[text.textRight, text.textBold, colors.textOnBackground, fonts.lg]}>
            פרטי משתמש
          </Text>
          <UserInfoContainer />
          <Button
            mode="contained-tonal"
            style={common.rounded}
            textColor={colors.textOnBackground.color}
            onPress={logUserOut}
          >
            התנתקות
          </Button>
        </View>
      }
    />
  );
};

export default UserDrawer;
