import useStyles from "@/styles/useGlobalStyles";
import { FC, useState } from "react";
import { View } from "react-native";
import { TextInput as RNPTextInput, TextInputProps } from "react-native-paper";
import { ConditionalRender } from "./ConditionalRender";
import Icon from "../Icon/Icon";

const TextInput: FC<TextInputProps> = ({ style, error, ...props }) => {
  const { colors, common } = useStyles();

  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.borderError : focused ? colors.borderPrimary : colors.outline;
  const borderwidth = focused ? common.borderSm : common.borderXsm;

  return (
    <View style={{ position: "relative" }}>
      <RNPTextInput
        underlineColor="transparent"
        underlineStyle={{ width: 0 }}
        cursorColor={colors.textPrimary.color}
        textColor={colors.textPrimary.color}
        selectionColor={colors.textPrimary.color}
        placeholderTextColor="grey"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        contentStyle={{ paddingRight: error ? 30 : 8 }}
        style={[
          {
            borderWidth: 0,
            textAlign: "right",
            borderRadius: 9,
            height: 38,
            borderTopLeftRadius: 9,
            borderTopRightRadius: 9,
          },
          common.roundedSm,
          borderColor,
          borderwidth,
          colors.background,
          style,
        ]}
        {...props}
      />
      <ConditionalRender condition={error}>
        <View style={[{ position: "absolute", right: 10, top: 12 }]}>
          <Icon name="info" height={18} width={18} color={colors.textDanger.color} />
        </View>
      </ConditionalRender>
    </View>
  );
};

export default TextInput;
