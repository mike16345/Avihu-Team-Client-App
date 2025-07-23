import useStyles from "@/styles/useGlobalStyles";
import { FC, ReactNode, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Modal,
  ModalProps,
  Platform,
  BackHandler,
} from "react-native";
import Icon from "../Icon/Icon";
import { Text } from "./Text";
import { IconName } from "@/constants/iconMap";
import { ConditionalRender } from "./ConditionalRender";
import FrameShadow from "./FrameShadow";

interface CustomModalProps extends ModalProps {
  title?: ReactNode;
  dismissIcon?: IconName;
}

export const CustomModal: FC<CustomModalProps> = ({
  onDismiss,
  title,
  dismissIcon = "close",
  ...props
}) => {
  const { colors, common, layout, spacing, fonts } = useStyles();
  const { height } = useWindowDimensions();

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
        <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
          <TouchableOpacity onPress={onDismiss}>
            <Icon name={dismissIcon} />
          </TouchableOpacity>

          <ConditionalRender condition={typeof title === "string"}>
            <Text style={[colors.textPrimary, fonts.lg]}>{title}</Text>
          </ConditionalRender>

          <ConditionalRender condition={typeof title !== "string"}>{title}</ConditionalRender>
        </View>
        <FrameShadow>
          <View
            style={[
              colors.backgroundSecondary,
              common.borderSm,
              colors.borderSurface,
              { height: height * 0.8 },
              common.rounded,
              spacing.pdDefault,
            ]}
          >
            {props.children}
          </View>
        </FrameShadow>
      </View>
    </Modal>
  );
};
