import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect } from "react";
import {
  TouchableOpacity,
  View,
  Modal,
  ModalProps,
  Platform,
  BackHandler,
  ViewProps,
  ViewStyle,
  StyleProp,
} from "react-native";
import Icon from "../Icon/Icon";
import { Text } from "./Text";
import { IconName } from "@/constants/iconMap";
import { ConditionalRender } from "./ConditionalRender";
import FrameShadow from "./FrameShadow";

interface CustomModalProps extends Omit<ModalProps, "onDismiss"> {
  style?: StyleProp<ViewStyle>;
}

type HeaderProps = ViewProps & { onDismiss?: () => void; dismissIcon?: IconName };

interface CompoundModal extends React.FC<CustomModalProps> {
  Header: React.FC<HeaderProps>;
  Content: React.FC<ViewProps>;
}

export const CustomModal: CompoundModal = ({ children, ...props }) => {
  const { colors, layout, spacing } = useStyles();

  return (
    <Modal {...props}>
      <View
        style={[
          colors.background,
          layout.sizeFull,
          spacing.gapDefault,
          spacing.pdStatusBar,
          spacing.pdBottomBar,
          spacing.pdLg,
          spacing.gapDefault,
          { paddingTop: spacing?.pdStatusBar?.paddingTop * 2 },
        ]}
      >
        {children}
      </View>
    </Modal>
  );
};

CustomModal.Header = ({ children, style, onDismiss, dismissIcon = "close", ...props }) => {
  const { layout, spacing, colors, fonts } = useStyles();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      if (onDismiss) {
        onDismiss();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => backHandler.remove();
  }, [onDismiss]);

  return (
    <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter, style]} {...props}>
      <TouchableOpacity onPress={onDismiss}>
        <Icon name={dismissIcon} />
      </TouchableOpacity>

      <ConditionalRender condition={typeof children === "string"}>
        <Text style={[colors.textPrimary, fonts.lg]}>{children}</Text>
      </ConditionalRender>

      <ConditionalRender condition={typeof children !== "string"}>{children}</ConditionalRender>
    </View>
  );
};

CustomModal.Content = ({ children, style, ...props }) => {
  const { spacing, colors, common } = useStyles();

  return (
    <FrameShadow>
      <View
        style={[
          colors.backgroundSecondary,
          common.borderSm,
          colors.borderSurface,
          common.rounded,
          spacing.pdDefault,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </FrameShadow>
  );
};
