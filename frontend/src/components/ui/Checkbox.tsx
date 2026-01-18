import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "./Text";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "./ConditionalRender";

interface CheckboxProps {
  isChecked?: boolean;
  onCheck: (val: boolean) => void;
  label?: string;
  direction?: "rtl" | "ltr";
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  onCheck,
  isChecked,
  label,
  direction = "rtl",
  disabled = false,
}) => {
  const { colors, common, layout, spacing } = useStyles();

  const background = isChecked ? colors.backgroundPrimary : {};
  const flexDirection = direction == "rtl" ? layout.flexRow : layout.flexRowReverse;

  return (
    <TouchableOpacity
      onPress={() => onCheck(!isChecked)}
      style={[
        flexDirection,
        layout.itemsCenter,
        spacing.gapDefault,
        layout.alignSelfStart,
        disabled && styles.disabled,
      ]}
      disabled={disabled}
    >
      <View
        style={[common.roundedXs, common.borderXsm, styles.checkbox, layout.center, background]}
      >
        <Icon name="check" height={15} width={15} color={colors.textOnPrimary.color} />
      </View>
      <ConditionalRender condition={label}>
        <Text style={colors.textPrimary}>{label}</Text>
      </ConditionalRender>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: { height: 20, width: 20 },
  disabled: { opacity: 0.5 },
});

export default Checkbox;
