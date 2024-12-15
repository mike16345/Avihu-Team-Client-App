import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { View } from "react-native";
import { TextInput } from "react-native-paper";
import { ICredentialsErrors } from "./Login";
import { Text } from "../ui/Text";
import PasswordIndicator from "./PasswordIndicator";

interface ConfirmPasswordProps {
  handlePasswordChange: (val: string) => void;
  handlePasswordConfirmChange: (val: string) => void;
  errors: ICredentialsErrors;
  value?: string;
}

const ConfirmPassword: React.FC<ConfirmPasswordProps> = ({
  errors,
  handlePasswordChange,
  handlePasswordConfirmChange,
  value,
}) => {
  const { text, colors, spacing } = useStyles();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowconfirmPassword] = useState(false);

  return (
    <View>
      <View>
        <Text style={[text.textRight, spacing.pdHorizontalXs, colors.textOnBackground]}>סיסמה</Text>
        <TextInput
          style={[text.textRight, { width: "100%" }]}
          mode="outlined"
          activeOutlineColor={colors.borderSecondary.borderColor}
          error={!!(errors.password || errors.validPassword)}
          secureTextEntry={!showPassword}
          onChangeText={(val) => handlePasswordChange(val)}
          left={
            <TextInput.Icon
              onPress={() => setShowPassword((show) => !show)}
              icon={showPassword ? "eye-off" : "eye"}
            />
          }
        />

        {(errors.validPassword || errors.password) && <PasswordIndicator password={value || ``} />}
      </View>
      <View>
        <Text style={[text.textRight, spacing.pdHorizontalXs, colors.textOnBackground]}>
          אישור סיסמה
        </Text>
        <TextInput
          style={[text.textRight, { width: "100%" }]}
          mode="outlined"
          activeOutlineColor={colors.borderSecondary.borderColor}
          error={Boolean(errors.confirmPassword)}
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
