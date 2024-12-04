import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import RightDrawer from "../ui/RightDrawer";
import { Text } from "../ui/Text";
import UserInfoContainer from "./UserInfoContainer";
import { Button } from "react-native-paper";
import { useUserDrawer } from "@/store/userDrawerStore";

const UserDrawer = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { openUserDrawer, setOpenUserDrawer } = useUserDrawer();

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
          >
            התנתקות
          </Button>
        </View>
      }
    />
  );
};

export default UserDrawer;
