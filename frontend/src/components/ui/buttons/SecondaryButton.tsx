import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import React, { ReactNode } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ConditionalRender";
import ButtonShadow from "./ButtonShadow";
import { IconName } from "@/constants/iconMap";
import Icon from "@/components/Icon/Icon";
import { Text } from "../Text";

interface secondaryButtonProps {
  children: ReactNode;
  rightIcon?: IconName;
  leftIcon?: IconName;
  size?: "sm" | "md";
  shadow?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  alignStart?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SecondaryButton: React.FC<secondaryButtonProps> = ({
  children,
  rightIcon,
  leftIcon,
  size = "md",
  shadow = true,
  alignStart = true,
  onPress,
  disabled,
  style,
}) => {
  const { colors, common, fonts, layout, spacing } = useStyles();

  const padding = size == "md" ? spacing.pdSm : spacing.pdXs;
  const sizing = 20;

  return (
    <ButtonShadow style={[alignStart && layout.alignSelfStart]} shadow={shadow}>
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={[
          colors.backgroundSurface,
          common.rounded,
          common.borderXsm,
          colors.outline,
          layout.alignSelfStart,
          layout.flexRow,
          layout.center,
          spacing.gapDefault,
          padding,
          style,
        ]}
      >
        <ConditionalRender condition={rightIcon}>
          <Icon name={rightIcon} height={sizing} width={sizing} />
        </ConditionalRender>

        <ConditionalRender condition={typeof children === "string"}>
          <Text fontVariant="semibold" style={[size == "sm" ? fonts.sm : fonts.md]}>
            {children}
          </Text>
        </ConditionalRender>

        <ConditionalRender condition={typeof children !== "string"}>{children}</ConditionalRender>

        <ConditionalRender condition={leftIcon}>
          <Icon name={leftIcon} height={sizing} width={sizing} />
        </ConditionalRender>
      </TouchableOpacity>
    </ButtonShadow>
  );
};

export default SecondaryButton;
