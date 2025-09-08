import useStyles from "@/styles/useGlobalStyles";
import { FC, ReactNode, useRef } from "react";
import { View, TextInput, TextInputProps, StyleSheet } from "react-native";
import { ConditionalRender } from "../ConditionalRender";
import Icon from "../../Icon/Icon";
import { Text } from "../Text";

export interface InputProps extends TextInputProps {
  error?: boolean;
  label?: ReactNode;
}

const Input: FC<InputProps> = ({ style, error, label, ...props }) => {
  const { colors, common, spacing, layout } = useStyles();

  const inputRef = useRef<TextInput>(null);

  const borderColor = error
    ? colors.borderError
    : inputRef.current?.isFocused()
      ? colors.borderPrimary
      : colors.outline;
  const borderwidth = inputRef.current?.isFocused() ? common.borderSm : common.borderXsm;

  return (
    <View style={spacing.gapSm}>
      <ConditionalRender condition={label}>
        <Text
          fontSize={16}
          fontVariant="semibold"
          style={[layout.alignSelfStart, spacing.pdHorizontalXs, colors.textPrimary]}
        >
          {label}
        </Text>
      </ConditionalRender>

      <View style={{ position: "relative" }}>
        <TextInput
          ref={inputRef}
          cursorColor={colors.textPrimary.color}
          selectionColor={colors.textPrimary.color}
          placeholderTextColor="grey"
          onFocus={() => {
            if (!inputRef.current || !props.value) return;
            inputRef.current.setSelection(props.value?.length, props.value?.length);
          }}
          underlineColorAndroid="transparent"
          style={[
            error ? spacing.pdHorizontalXl : spacing.pdHorizontalSm,
            styles.input,
            common.roundedSm,
            borderColor,
            borderwidth,

            colors.background,
            {
              fontFamily: "Assistant-Regular",
              fontSize: 16,
              color: colors.textPrimary.color,
            },
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
    paddingVertical: 8, // ✅ let content define height
    lineHeight: 20, // ✅ plays nice with fontSize: 16
    textAlignVertical: "center", // ✅ Android vertical centering
    includeFontPadding: false, // ✅ trims extra Android font padding
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  errorIcon: { position: "absolute", start: 10, top: 10 },
});

export default Input;
