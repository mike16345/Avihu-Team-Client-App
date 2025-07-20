import useStyles from "@/styles/useGlobalStyles";
import { FC, useState } from "react";
import { View, TextInput, TextInputProps, StyleSheet } from "react-native";
import { ConditionalRender } from "./ConditionalRender";
import Icon from "../Icon/Icon";

interface InputProps extends TextInputProps {
  error?: boolean;
}

const Input: FC<InputProps> = ({ style, error, ...props }) => {
  const { colors, common, spacing } = useStyles();

  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.borderError : focused ? colors.borderPrimary : colors.outline;
  const borderwidth = focused ? common.borderSm : common.borderXsm;

  return (
    <View style={{ position: "relative" }}>
      <TextInput
        cursorColor={colors.textPrimary.color}
        selectionColor={colors.textPrimary.color}
        placeholderTextColor="grey"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          error ? spacing.pdHorizontalXl : spacing.pdHorizontalSm,
          styles.input,
          common.roundedSm,
          borderColor,
          borderwidth,
          colors.background,
          style,
        ]}
        {...props}
      />
      <ConditionalRender condition={error}>
        <View style={styles.errorIcon}>
          <Icon name="info" height={18} width={18} color={colors.textDanger.color} />
        </View>
      </ConditionalRender>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 0,
    textAlign: "right",
    borderRadius: 9,
    height: 38,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  errorIcon: { position: "absolute", right: 10, top: 12 },
});
export default Input;
