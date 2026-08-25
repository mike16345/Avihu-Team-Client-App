import Icon from "@/components/Icon/Icon";
import { ModalContextProvider, useModalContext } from "@/context/useModal";
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
import { ConditionalRender } from "../ConditionalRender";
import { Text } from "../Text";
import useCommonStyles from "@/styles/useCommonStyles";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import { Card } from "../Card";
import { IconName } from "@/constants/iconMap";
import ToastContainer from "../toast/ToastContainer";
import { useToastStore } from "@/store/toastStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getModalSafeAreaPadding, MODAL_HORIZONTAL_PADDING } from "./modalSafeArea";

export interface CustomModalProps extends ModalProps {
  style?: StyleProp<ViewStyle>;
  withToasts?: boolean;
}

type HeaderProps = ViewProps & { dismissIcon?: IconName };
type ContentProps = ViewProps & { variant?: "gray" | "white" };

interface CompoundModal extends React.FC<CustomModalProps> {
  Header: React.FC<HeaderProps>;
  Content: React.FC<ContentProps>;
}

export const CustomModal: CompoundModal = ({
  children,
  onDismiss,
  visible,
  withToasts = false,
  ...props
}) => {
  const { colors, layout, spacing } = useStyles();
  const insets = useSafeAreaInsets();
  const modalToasts = useToastStore((state) => state.modalToasts);
  const safeAreaPadding = getModalSafeAreaPadding(insets);

  const animationValue = useRef(new Animated.Value(0)).current;

  const handleDismiss = () => {
    if (!onDismiss) return;

    Animated.timing(animationValue, {
      toValue: 0,
      useNativeDriver: true,
      duration: 200,
    }).start(() => onDismiss());
  };

  useEffect(() => {
    if (!visible) return;

    Animated.timing(animationValue, {
      toValue: 1,
      useNativeDriver: true,
      duration: 200,
    }).start();
  }, [visible]);

  return (
    <Modal statusBarTranslucent visible={visible} onRequestClose={handleDismiss} {...props}>
      <Animated.View
        style={[
          colors.background,
          spacing.gapDefault,
          layout.flex1,
          { paddingHorizontal: MODAL_HORIZONTAL_PADDING },
          props.style,
          {
            transform: [{ scale: animationValue }],
            opacity: animationValue,
            ...safeAreaPadding,
          },
        ]}
      >
        <ModalContextProvider onDismiss={handleDismiss}>
          {children}
          <ToastContainer modalToasts={withToasts ? modalToasts : undefined} />
        </ModalContextProvider>
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
  const { sizeFull } = useLayoutStyles();

  return (
    <Card style={[roundedMd, sizeFull, style]} variant={variant}>
      {children}
    </Card>
  );
};
