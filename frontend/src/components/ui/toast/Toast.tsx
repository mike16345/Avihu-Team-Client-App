import { View } from "react-native";
import React from "react";
import { Text } from "../Text";
import { IToast } from "@/interfaces/toast";
import useStyles from "@/styles/useGlobalStyles";

const Toast: React.FC<{ toast: IToast }> = ({ toast: { message, title, type } }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const successContainer = [colors.backgroundSuccessContainer, colors.borderSuccess];
  const errorContainer = [colors.backgroundErrorContainer, colors.borderError];
  const successTitle = [colors.backgroundSuccess];
  const errorTitle = [colors.backgroundError];

  const titleContainer = type == "error" ? errorTitle : successTitle;
  const container = type == "error" ? errorContainer : successContainer;
  const messageStyle = type == "error" ? colors.textDanger : colors.textSuccess;

  return (
    <View
      style={[
        common.borderXsm,
        common.roundedFull,
        spacing.pdXs,
        layout.flexRow,
        spacing.gapDefault,
        layout.itemsCenter,
        layout.alignSelfCenter,
        spacing.pdHorizontalSm,
        container,
      ]}
    >
      <View style={[common.roundedFull, spacing.pdHorizontalSm, layout.center, titleContainer]}>
        <Text style={[colors.textOnPrimary, text.textBold]}>{title}</Text>
      </View>

      <Text style={messageStyle}>{message}</Text>
    </View>
  );
};

export default Toast;
