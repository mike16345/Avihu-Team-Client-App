import { I18nManager, TouchableOpacity, View } from "react-native";
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
        style={[
          { position: "absolute", top: props.label ? "52%" : "25%" },
          I18nManager.isRTL ? { end: 10 } : { start: 10 },
        ]}
      >
        <Icon name={showPassword ? "eyeClose" : "eye"} />
      </TouchableOpacity>
    </View>
  );
};

export default PasswordInput;
