import { loginWithPassword } from "@/API/authApi";
import { NO_ACCESS } from "@/constants/Constants";
import { useToast } from "@/hooks/useToast";
import { IUser } from "@/interfaces/User";
import { setAuthSessionFromLogin } from "@/services/authSession";
import useStyles from "@/styles/useGlobalStyles";
import { errorNotificationHaptic } from "@/utils/haptics";
import { testEmail } from "@/utils/utils";
import React, { useState } from "react";
import { Keyboard, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ICredentialsErrors, IUserCredentials } from "./Login";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import Input from "../ui/inputs/Input";
import PasswordInput from "../ui/inputs/PasswordInput";
import { Text } from "../ui/Text";

interface LoginFormProps {
  onLoginSuccess: (user: IUser) => void;
  onForgotPasswordPress: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPasswordPress, onLoginSuccess }) => {
  const { colors, spacing, text, layout } = useStyles();
  const { triggerErrorToast } = useToast();

  const [inputtedCrendentials, setInputtedCredentials] = useState<IUserCredentials>({
    email: ``,
    password: ``,
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<ICredentialsErrors>({});

  const handleSubmit = () => {
    const { email, password } = inputtedCrendentials;
    const formattedEmail = email.toLowerCase().trim();
    const errors: ICredentialsErrors = {};

    Keyboard.dismiss();

    if (!testEmail(formattedEmail)) {
      errors[`email`] = true;
    } else {
      delete errors[`email`];
    }

    if (!password) {
      errors[`password`] = true;
    } else {
      delete errors[`password`];
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      errorNotificationHaptic();
      return;
    }

    setLoading(true);
    loginWithPassword(formattedEmail, password)
      .then(async (response) => {
        console.log(`Login response:`, JSON.stringify(response, undefined, 2));
        if (response.user.status == "inactive") {
          triggerErrorToast({ message: NO_ACCESS, duration: 2000 });
          return;
        }

        await setAuthSessionFromLogin(response);
        onLoginSuccess(response.user as IUser);
      })
      .catch((e) => {
        console.log(`Login error:`, JSON.stringify(e));
        triggerErrorToast({ message: "מייל או סיסמה שגויים" });
      })
      .finally(() => setLoading(false));
  };

  return (
    <Animated.View entering={FadeIn.duration(500)} style={[spacing.gap20]}>
      <Input
        keyboardType="email-address"
        label="אימייל"
        placeholder="הכנס אימייל"
        error={formErrors.email}
        importantForAutofill="yes"
        textContentType="emailAddress"
        autoComplete="email"
        autoCorrect={false}
        onChangeText={(val) => {
          setInputtedCredentials((prev) => {
            return {
              ...prev,
              email: val,
            };
          });
        }}
        value={inputtedCrendentials.email}
      />

      <PasswordInput
        label="סיסמה"
        placeholder="הכנס סיסמה"
        error={formErrors.password}
        value={inputtedCrendentials.password}
        onChangeText={(val) =>
          setInputtedCredentials((prev) => {
            return {
              ...prev,
              password: val,
            };
          })
        }
      />

      <TouchableOpacity onPress={onForgotPasswordPress}>
        <Text
          fontVariant="semibold"
          fontSize={16}
          style={[colors.textPrimary, text.textBold, layout.alignSelfStart]}
        >
          שכחתי סיסמה
        </Text>
      </TouchableOpacity>

      <PrimaryButton block mode="dark" onPress={handleSubmit} loading={loading}>
        כניסה
      </PrimaryButton>
    </Animated.View>
  );
};

export default LoginForm;
