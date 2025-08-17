import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { View } from "react-native";
import { ICredentialsErrors } from "./Login";
import PasswordInput from "../ui/inputs/PasswordInput";

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
  const { spacing } = useStyles();

  return (
    <View style={[spacing.gapXl]}>
      <PasswordInput
        label="סיסמא חדשה"
        placeholder="הכנס סיסמא"
        error={!!(errors.password || errors.validPassword)}
        onChangeText={(val) => handlePasswordChange(val)}
      />

      <PasswordInput
        label="אימות סיסמא"
        error={!!errors.confirmPassword}
        placeholder="אימות סיסמא"
        onChangeText={(val) => handlePasswordConfirmChange(val)}
      />
    </View>
  );
};

export default ConfirmPassword;
