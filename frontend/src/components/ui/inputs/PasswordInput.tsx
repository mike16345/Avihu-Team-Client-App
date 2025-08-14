import { TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import Input, { InputProps } from "./Input";
import Icon from "@/components/Icon/Icon";

const PasswordInput: React.FC<InputProps> = ({ ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ position: "relative" }}>
      <Input secureTextEntry={!showPassword} {...props} />

      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        style={{ position: "absolute", end: 10, top: props.label ? 30 : 7 }}
      >
        <Icon name={showPassword ? "eyeClose" : "eye"} />
      </TouchableOpacity>
    </View>
  );
};

export default PasswordInput;
