import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import { View } from "react-native";
import { ICredentialsErrors } from "./Login";
import { Text } from "../ui/Text";
import PasswordIndicator from "./PasswordIndicator";
import TextInput from "../ui/TextInput";
import { TextInput as RNPTextInput } from "react-native-paper";

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
    <View style={[spacing.gapXl]}>
      <View style={[spacing.pdHorizontalLg]}>
        <PasswordIndicator password={value || ""} />
      </View>
      <View>
        <Text
          style={[text.textRight, spacing.pdHorizontalXs, colors.textOnBackground, text.textBold]}
        >
          סיסמה
        </Text>
        <TextInput
          style={[text.textRight, { width: "100%" }]}
          activeOutlineColor={colors.borderSecondary.borderColor}
          placeholder="הכנס סיסמה חדשה"
          error={!!(errors.password || errors.validPassword)}
          secureTextEntry={!showPassword}
          onChangeText={(val) => handlePasswordChange(val)}
          left={
            <RNPTextInput.Icon
              onPress={() => setShowPassword((show) => !show)}
              icon={showPassword ? "eye-off" : "eye"}
            />
          }
        />
      </View>
      <View>
        <Text
          style={[text.textRight, spacing.pdHorizontalXs, colors.textOnBackground, text.textBold]}
        >
          אישור סיסמה
        </Text>
        <TextInput
          style={[text.textRight]}
          activeOutlineColor={colors.borderSecondary.borderColor}
          error={Boolean(errors.confirmPassword)}
          placeholder="אמת סיסמה חדשה"
          secureTextEntry={!showConfirmPassword}
          onChangeText={(val) => handlePasswordConfirmChange(val)}
          left={
            <RNPTextInput.Icon
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
