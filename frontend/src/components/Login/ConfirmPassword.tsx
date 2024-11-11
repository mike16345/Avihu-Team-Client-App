import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { TextInput } from "react-native-paper";
import { ICredentialsErrors } from "./Login";

interface ConfirmPasswordProps {
  handlePasswordChange: (val: string) => void;
  handlePasswordConfirmChange: (val: string) => void;
  errors: ICredentialsErrors;
}

const ConfirmPassword: React.FC<ConfirmPasswordProps> = ({
  errors,
  handlePasswordChange,
  handlePasswordConfirmChange,
}) => {
  const { text } = useStyles();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowconfirmPassword] = useState(false);

  return (
    <View>
      <View>
        <TextInput
          style={[text.textRight, { width: "100%" }]}
          placeholder="סיסמא..."
          secureTextEntry={!showPassword}
          onChangeText={(val) => handlePasswordChange(val)}
          left={
            <TextInput.Icon
              onPress={() => setShowPassword((show) => !show)}
              icon={showPassword ? "eye-off" : "eye"}
            />
          }
        />
        <Text style={[text.textDanger, text.textRight]}>{errors.password}</Text>
      </View>
      <View>
        <TextInput
          style={[text.textRight, { width: "100%" }]}
          placeholder="הקלידו את הסיסמא שוב..."
          secureTextEntry={!showConfirmPassword}
          onChangeText={(val) => handlePasswordConfirmChange(val)}
          left={
            <TextInput.Icon
              onPress={() => setShowconfirmPassword((show) => !show)}
              icon={showConfirmPassword ? "eye-off" : "eye"}
            />
          }
        />
        <Text style={[text.textDanger, text.textRight]}>{errors.confirmPassword}</Text>
      </View>
    </View>
  );
};

export default ConfirmPassword;
