import { Text, TouchableOpacity } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ConditionalRender";
import ButtonShadow from "../ButtonShadow";
import { IconName } from "@/constants/iconMap";
import Icon from "@/components/Icon/Icon";

interface secondaryButtonProps {
  label: string;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  size?: "sm" | "md";
  shadow?: boolean;
  onPress?: () => void;
}

const SecondaryButton: React.FC<secondaryButtonProps> = ({
  label,
  leadingIcon,
  trailingIcon,
  size = "md",
  shadow = true,
  onPress,
}) => {
  const { colors, common, fonts, layout, spacing } = useStyles();

  return (
    <ButtonShadow shadow={shadow}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          colors.backgroundSurface,
          common.rounded,
          common.borderXsm,
          colors.outline,
          { alignSelf: "flex-start" },
          layout.flexRow,
          layout.center,
          spacing.gapDefault,
          size == "md" ? spacing.pdSm : spacing.pdXs,
        ]}
      >
        <ConditionalRender
          condition={leadingIcon}
          children={
            <Icon
              name={leadingIcon || "arrowLeft"}
              height={size === "sm" ? fonts.sm.fontSize : undefined}
              width={size === "sm" ? fonts.sm.fontSize : undefined}
            />
          }
        />
        <Text style={[size == "sm" ? fonts.sm : fonts.md]}>{label}</Text>
        <ConditionalRender
          condition={trailingIcon}
          children={
            <Icon
              name={trailingIcon || "arrowLeft"}
              height={size === "sm" ? fonts.sm.fontSize : undefined}
              width={size === "sm" ? fonts.sm.fontSize : undefined}
            />
          }
        />
      </TouchableOpacity>
    </ButtonShadow>
  );
};

export default SecondaryButton;
