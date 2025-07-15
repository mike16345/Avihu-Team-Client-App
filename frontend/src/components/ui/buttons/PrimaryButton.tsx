import { TouchableOpacity } from "react-native";
import React, { ReactNode } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ConditionalRender";
import SpinningIcon from "../loaders/SpinningIcon";
import { IconName } from "@/constants/iconMap";
import Icon from "@/components/Icon/Icon";
import { Text } from "../Text";

interface PrimaryButtonProps {
  children: ReactNode;
  mode: "dark" | "light";
  block?: boolean;
  icon?: IconName;
  loading?: boolean;
  onPress?: () => void;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  mode = "dark",
  block,
  icon,
  loading,
  onPress,
}) => {
  const { colors, common, layout, spacing, text } = useStyles();

  const modeSpecificStyles =
    mode == "dark"
      ? colors.backgroundPrimary
      : [colors.backgroundSurface, common.borderXsm, colors.outline];

  const width = block ? layout.widthFull : layout.alignSelfStart;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[
        layout.center,
        spacing.pdDefault,
        common.rounded,
        layout.flexRow,
        spacing.gapDefault,
        layout.itemsCenter,
        width,
        modeSpecificStyles,
      ]}
    >
      <ConditionalRender condition={!loading}>
        <>
          <ConditionalRender condition={icon}>
            <Icon
              name={icon}
              color={mode == "dark" ? colors.textOnPrimary.color : colors.textPrimary.color}
            />
          </ConditionalRender>

          <ConditionalRender condition={typeof children === "string"}>
            <Text
              style={[mode == "dark" ? colors.textOnPrimary : colors.textPrimary, text.textBold]}
            >
              {children}
            </Text>
          </ConditionalRender>

          <ConditionalRender condition={typeof children !== "string"}>{children}</ConditionalRender>
        </>
      </ConditionalRender>

      <ConditionalRender condition={loading}>
        <SpinningIcon mode={mode} />
      </ConditionalRender>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
