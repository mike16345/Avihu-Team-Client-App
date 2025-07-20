import { TouchableOpacity } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import ButtonShadow from "../ButtonShadow";
import { IconName } from "@/constants/iconMap";
import Icon from "@/components/Icon/Icon";

interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, disabled }) => {
  const { colors, common, spacing } = useStyles();

  return (
    <ButtonShadow>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          colors.backgroundSurface,
          spacing.pdLg,
          common.rounded,
          common.borderXsm,
          colors.outline,
        ]}
      >
        <Icon name={icon} />
      </TouchableOpacity>
    </ButtonShadow>
  );
};

export default IconButton;
