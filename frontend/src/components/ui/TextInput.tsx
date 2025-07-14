import { FC, useState } from "react";
import { TextInput as RNPTextInput, TextInputProps } from "react-native-paper";

const TextInput: FC<TextInputProps> = ({ style, ...props }) => {
  return (
    <RNPTextInput
      underlineColor="transparent"
      underlineStyle={{ width: 0 }}
      contentStyle={{ fontWeight: `bold` }}
      style={[
        {
          borderWidth: 0,
          textAlign: "right",
          borderRadius: 9,
          height: 38,
          borderTopLeftRadius: 9,
          borderTopRightRadius: 9,
          backgroundColor: "rgba(150, 150, 150, 0.5)",
        },
        style,
      ]}
      {...props}
    />
  );
};

export default TextInput;
