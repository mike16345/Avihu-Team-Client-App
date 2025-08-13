import { Animated, Keyboard, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import Input from "../ui/inputs/Input";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import { ICredentialsErrors, IUserCredentials } from "./Login";
import { testEmail } from "@/utils/utils";
import { errorNotificationHaptic } from "@/utils/haptics";
import { NO_ACCESS } from "@/constants/Constants";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useUserStore } from "@/store/userStore";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { SESSION_TOKEN_KEY } from "@/constants/reactQuery";
import { useToast } from "@/hooks/useToast";
import { IUser } from "@/interfaces/User";
import PasswordInput from "../ui/inputs/PasswordInput";
import { useFadeIn } from "@/styles/useFadeIn";

interface LoginFormProps {
  onLoginSuccess: (user: IUser) => void;
  onForgotPasswordPress: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPasswordPress, onLoginSuccess }) => {
  const { colors, layout, spacing, text } = useStyles();
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const { loginUser } = useUserApi();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const { setItem } = useAsyncStorage(SESSION_TOKEN_KEY);

  const opacity = useFadeIn();
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
    loginUser(formattedEmail, password)
      .then((res) => {
        if (!res.data.data.user.hasAccess) {
          triggerErrorToast({ message: NO_ACCESS, duration: 2000 });
          return;
        }

        triggerSuccessToast({ message: res.message });
        onLoginSuccess(res.data.data.user);
        setCurrentUser(res?.data.data.user);
        setItem(JSON.stringify(res.data));
      })
      .catch((err) => {
        triggerErrorToast({ message: err.response.data.message });
      })
      .finally(() => setLoading(false));
  };

  return (
    <Animated.View style={[spacing.gapXl, { opacity }]}>
      <Input
        label="אימייל"
        placeholder="הכנס אימייל"
        error={formErrors.email}
        textContentType="emailAddress"
        onChangeText={(val) =>
          setInputtedCredentials({
            ...inputtedCrendentials,
            email: val,
          })
        }
        value={inputtedCrendentials.email}
      />

      <PasswordInput
        label="סיסמא"
        placeholder="הכנס סיסמה"
        error={formErrors.password}
        onChangeText={(val) => setInputtedCredentials({ ...inputtedCrendentials, password: val })}
      />

      <TouchableOpacity onPress={onForgotPasswordPress}>
        <Text style={[layout.alignSelfStart, colors.textPrimary, text.textBold]}>שכחתי סיסמה</Text>
      </TouchableOpacity>

      <PrimaryButton block mode="dark" onPress={handleSubmit} loading={loading}>
        כניסה
      </PrimaryButton>
    </Animated.View>
  );
};

export default LoginForm;
