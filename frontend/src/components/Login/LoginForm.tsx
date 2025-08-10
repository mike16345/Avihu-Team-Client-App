import { Keyboard, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import Input from "../ui/Input";
import Icon from "../Icon/Icon";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import { ICredentialsErrors, IUserCredentials } from "./Login";
import { testEmail } from "@/utils/utils";
import { errorNotificationHaptic } from "@/utils/haptics";
import { EMAIL_ERROR, NO_ACCESS, NO_PASSWORD } from "@/constants/Constants";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useUserStore } from "@/store/userStore";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { SESSION_TOKEN_KEY } from "@/constants/reactQuery";
import { useToast } from "@/hooks/useToast";
import { IUser } from "@/interfaces/User";

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

  const [inputtedCrendentials, setInputtedCredentials] = useState<IUserCredentials>({
    email: ``,
    password: ``,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<ICredentialsErrors>({});

  const handleSubmit = () => {
    const { email, password } = inputtedCrendentials;
    const formattedEmail = email.toLowerCase().trim();
    const errors: ICredentialsErrors = {};

    Keyboard.dismiss();

    if (!testEmail(formattedEmail)) {
      errors[`email`] = EMAIL_ERROR;
    } else {
      delete errors[`email`];
    }

    if (!password) {
      errors[`password`] = NO_PASSWORD;
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
    <View style={spacing.gapXl}>
      <View style={spacing.gapSm}>
        <Text style={[layout.alignSelfStart, colors.textPrimary]}>אימייל</Text>

        <Input
          placeholder="הכנס אימייל"
          keyboardType={"email-address"}
          autoCorrect={false}
          autoComplete="email"
          error={!!formErrors.email}
          textContentType="emailAddress"
          onChangeText={(val) =>
            setInputtedCredentials({
              ...inputtedCrendentials,
              email: val,
            })
          }
          value={inputtedCrendentials.email}
        />
      </View>
      <View style={[spacing.gapSm]}>
        <Text style={[layout.alignSelfStart, colors.textPrimary]}>סיסמה</Text>

        <View style={{ position: "relative" }}>
          <Input
            placeholder="הכנס סיסמה"
            secureTextEntry={!showPassword}
            error={!!formErrors.password}
            onChangeText={(val) =>
              setInputtedCredentials({ ...inputtedCrendentials, password: val })
            }
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", end: 10, top: 7 }}
          >
            <Icon name={showPassword ? "eyeClose" : "eye"} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={onForgotPasswordPress}>
        <Text style={[layout.alignSelfStart, colors.textPrimary, text.textBold]}>שכחתי סיסמה</Text>
      </TouchableOpacity>

      <PrimaryButton block mode="dark" onPress={handleSubmit} loading={loading}>
        כניסה
      </PrimaryButton>
    </View>
  );
};

export default LoginForm;
