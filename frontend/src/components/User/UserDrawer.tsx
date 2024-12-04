import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import RightDrawer from "../ui/RightDrawer";
import { Text } from "../ui/Text";
import NativeIcon from "../Icon/NativeIcon";
import UserInfoContainer from "./UserInfoContainer";

const UserDrawer = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { height, width } = useWindowDimensions();
  const [open, setOpen] = useState(true);

  return (
    <RightDrawer
      open={open}
      onClose={() => setOpen(false)}
      children={
        <View
          style={[
            common.borderDefault,
            layout.sizeFull,
            spacing.pdHorizontalDefault,
            spacing.pdStatusBar,
          ]}
        >
          <Text style={[text.textRight, text.textBold, colors.textOnBackground, fonts.lg]}>
            פרטי משתמש
          </Text>
          <UserInfoContainer />
        </View>
      }
    />
  );
};

export default UserDrawer;
