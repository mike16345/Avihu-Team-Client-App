import { StyleProp, TouchableOpacity } from "react-native";
import React, { ReactNode } from "react";
import useStyles from "@/styles/useGlobalStyles";
import ButtonShadow from "./ButtonShadow";
import { IconName } from "@/constants/iconMap";
import Icon from "@/components/Icon/Icon";
import { ViewStyle } from "react-native";
import { Text } from "../Text";
import { ConditionalRender } from "../ConditionalRender";

interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  label?: ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  disabled,
  style,
  label,
  size = 24,
}) => {
  const { colors, common, spacing, layout } = useStyles();

  return (
    <ButtonShadow style={layout.alignSelfStart}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          colors.backgroundSurface,
          spacing.pdLg,
          common.rounded,
          common.borderXsm,
          colors.outline,
          layout.alignSelfStart,
          layout.flexRow,
          layout.itemsCenter,
          spacing.gapSm,
          style,
        ]}
      >
        <ConditionalRender condition={label}>
          <ConditionalRender condition={typeof label === "string"}>
            <Text>{label}</Text>
          </ConditionalRender>

          <ConditionalRender condition={typeof label !== "string"}>{label}</ConditionalRender>
        </ConditionalRender>

        <Icon name={icon} height={size} width={size} />
      </TouchableOpacity>
    </ButtonShadow>
  );
};

export default IconButton;
