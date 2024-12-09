import useStyles from "@/styles/useGlobalStyles";
import { ScrollView, View } from "react-native";
import RightDrawer from "../ui/RightDrawer";
import { Text } from "../ui/Text";
import UserInfoContainer from "./UserInfoContainer";
import { Button } from "react-native-paper";
import { useUserDrawer } from "@/store/userDrawerStore";
import { useUserStore } from "@/store/userStore";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import NativeIcon from "../Icon/NativeIcon";

const UserDrawer = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { openUserDrawer, setOpenUserDrawer } = useUserDrawer();
  const { setCurrentUser } = useUserStore();
  const sessionStorage = useAsyncStorage("sessionToken");

  const logUserOut = () => {
    setOpenUserDrawer(false);
    setCurrentUser(null);
    sessionStorage.removeItem();
  };

  return (
    <RightDrawer
      open={openUserDrawer}
      onClose={() => setOpenUserDrawer(false)}
      children={
        <ScrollView
          style={[layout.sizeFull, spacing.pdHorizontalSm, spacing.pdStatusBar]}
          contentContainerStyle={[layout.justifyBetween, spacing.gapXxl, spacing.pdBottomBar]}
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
            icon={() => (
              <NativeIcon
                library="Ionicons"
                name="exit-outline"
                style={[fonts.lg, colors.textOnBackground]}
              />
            )}
          >
            התנתק
          </Button>
        </ScrollView>
      }
    />
  );
};

export default UserDrawer;
