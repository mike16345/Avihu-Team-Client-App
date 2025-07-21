import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "./Text";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "./ConditionalRender";

interface CheckboxProps {
  value?: boolean;
  onCheck: (val: boolean) => void;
  label?: string;
  direction?: "rtl" | "ltr";
}

const Checkbox: React.FC<CheckboxProps> = ({ onCheck, value, label, direction = "rtl" }) => {
  const { colors, common, layout, spacing } = useStyles();

  const background = value ? colors.backgroundPrimary : {};
  const flexDirection = direction == "rtl" ? layout.flexRow : layout.flexRowReverse;

  return (
    <TouchableOpacity
      onPress={() => onCheck(!value)}
      style={[flexDirection, layout.itemsCenter, spacing.gapDefault, layout.alignSelfStart]}
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
});

export default Checkbox;
