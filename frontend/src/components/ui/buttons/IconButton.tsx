import { StyleProp, TouchableOpacity } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import ButtonShadow from "./ButtonShadow";
import { IconName } from "@/constants/iconMap";
import Icon from "@/components/Icon/Icon";
import { ViewStyle } from "react-native";

interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, disabled, style, size = 24 }) => {
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
          style,
        ]}
      >
        <Icon name={icon} height={size} width={size} />
      </TouchableOpacity>
    </ButtonShadow>
  );
};

export default IconButton;
