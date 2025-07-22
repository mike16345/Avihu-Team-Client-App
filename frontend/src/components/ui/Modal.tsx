import useStyles from "@/styles/useGlobalStyles";
import { FC, ReactNode } from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { Props } from "react-native-paper/lib/typescript/components/Modal";
import Icon from "../Icon/Icon";
import { Text } from "./Text";
import { IconName } from "@/constants/iconMap";
import { ConditionalRender } from "./ConditionalRender";

interface CustomModalProps extends Props {
  title?: ReactNode;
  dismissIcon?: IconName;
}

export const CustomModal: FC<CustomModalProps> = ({
  style,
  dismissable = false,
  dismissableBackButton = true,
  onDismiss,
  title,
  dismissIcon = "close",
  ...props
}) => {
  const { colors, common, layout, spacing } = useStyles();
  const { height } = useWindowDimensions();

  return (
    <Portal>
      <Modal
        style={[
          colors.background,
          { height },
          styles.modal,
          spacing.pdLg,
          spacing.pdBottomBar,
          spacing.pdStatusBar,
          spacing.gapDefault,
        ]}
        dismissable={dismissable}
        dismissableBackButton={dismissableBackButton}
        {...props}
      >
        <View style={[layout.sizeFull, spacing.gapDefault, spacing.pdStatusBar]}>
          <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
            <TouchableOpacity onPress={onDismiss}>
              <Icon name={dismissIcon} />
            </TouchableOpacity>

            <ConditionalRender condition={typeof title === "string"}>
              <Text style={colors.textPrimary}>{title}</Text>
            </ConditionalRender>

            <ConditionalRender condition={typeof title !== "string"}>{title}</ConditionalRender>
          </View>
          <View
            style={[
              colors.backgroundSecondary,
              common.borderSm,
              colors.borderSurface,
              layout.flex1,
              common.rounded,
              spacing.pdDefault,
            ]}
          >
            {props.children}
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    direction: "rtl", // For until we figure out the directions
    marginTop: -1, // Ensures the portal starts at top of screen
  },
});
