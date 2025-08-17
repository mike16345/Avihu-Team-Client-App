import useStyles from "@/styles/useGlobalStyles";
import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  View,
  Modal,
  ModalProps,
  ViewProps,
  ViewStyle,
  StyleProp,
  Animated,
} from "react-native";
import { IconName } from "@/constants/iconMap";
import { ModalContextProvider, useModalContext } from "@/context/useModal";
import useCommonStyles from "@/styles/useCommonStyles";
import { ConditionalRender } from "../ConditionalRender";
import Icon from "@/components/Icon/Icon";
import { Text } from "../Text";
import { Card } from "../Card";

export interface CustomModalProps extends ModalProps {
  style?: StyleProp<ViewStyle>;
}

type HeaderProps = ViewProps & { dismissIcon?: IconName };
type ContentProps = ViewProps & { variant?: "gray" | "white" };

interface CompoundModal extends React.FC<CustomModalProps> {
  Header: React.FC<HeaderProps>;
  Content: React.FC<ContentProps>;
}

export const CustomModal: CompoundModal = ({ children, onDismiss, visible, ...props }) => {
  const { colors, layout, spacing } = useStyles();

  const opcaity = useRef(new Animated.Value(0)).current;

  const handleDismiss = () => {
    if (!onDismiss) return;

    Animated.timing(opcaity, {
      toValue: 0,
      useNativeDriver: true,
      duration: 300,
    }).start(() => onDismiss());
  };

  useEffect(() => {
    if (!visible) return;

    Animated.timing(opcaity, {
      toValue: 1,
      useNativeDriver: true,
      duration: 300,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} onRequestClose={handleDismiss} {...props}>
      <Animated.View
        style={[
          colors.background,
          layout.sizeFull,
          spacing.gapDefault,
          spacing.pdStatusBar,
          spacing.pdBottomBar,
          spacing.pdLg,
          spacing.gapDefault,
          {
            opacity: opcaity,
            paddingTop: spacing?.pdStatusBar?.paddingTop * 2,
            paddingBottom: spacing.pdBottomBar.paddingBottom * 2,
          },
        ]}
      >
        <ModalContextProvider onDismiss={handleDismiss}>{children}</ModalContextProvider>
      </Animated.View>
    </Modal>
  );
};

CustomModal.Header = ({ children, style, dismissIcon = "close", ...props }) => {
  const { layout, spacing, colors, fonts } = useStyles();
  const { onDismiss } = useModalContext();

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

CustomModal.Content = ({ children, variant = "gray", style }) => {
  const { roundedMd } = useCommonStyles();

  return (
    <Card style={[roundedMd, style]} variant={variant}>
      {children}
    </Card>
  );
};
