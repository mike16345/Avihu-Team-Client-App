import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import RightDrawer from "../ui/RightDrawer";
import { Text } from "../ui/Text";
import NativeIcon from "../Icon/NativeIcon";
import UserInfoContainer from "./UserInfoContainer";
import { Button } from "react-native-paper";

const UserDrawer = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const [open, setOpen] = useState(true);

  return (
    <RightDrawer
      open={open}
      onClose={() => setOpen(false)}
      children={
        <View
          style={[
            layout.sizeFull,
            spacing.pdHorizontalDefault,
            spacing.pdStatusBar,
            layout.justifyBetween,
          ]}
        >
          <Text style={[text.textRight, text.textBold, colors.textOnBackground, fonts.lg]}>
            פרטי משתמש
          </Text>
          <UserInfoContainer />
          <Button mode="contained" style={common.rounded} textColor={colors.textOnBackground.color}>
            התנתקות
          </Button>
        </View>
      }
    />
  );
};

export default UserDrawer;
