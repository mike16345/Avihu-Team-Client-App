import useStyles from "@/styles/useGlobalStyles";
import { FC, ReactNode, useState } from "react";
import { View, TextInput, TextInputProps, StyleSheet } from "react-native";
import { ConditionalRender } from "../ConditionalRender";
import Icon from "../../Icon/Icon";
import { Text } from "../Text";

export interface InputProps extends TextInputProps {
  error?: boolean;
  label?: ReactNode;
}

const Input: FC<InputProps> = ({ style, error, label, ...props }) => {
  const { colors, common, spacing, text } = useStyles();

  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.borderError : focused ? colors.borderPrimary : colors.outline;
  const borderwidth = focused ? common.borderSm : common.borderXsm;

  return (
    <View style={spacing.gapSm}>
      <ConditionalRender condition={label}>
        <Text style={[spacing.pdHorizontalXs, colors.textPrimary, text.textBold]}>{label}</Text>
      </ConditionalRender>

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
  errorIcon: { position: "absolute", start: 10, top: 10 },
});
export default Input;
