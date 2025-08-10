import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import appIcon from "@assets/app-icon.png";
import useStyles from "@/styles/useGlobalStyles";
import { IUser } from "@/interfaces/User";
import { Text } from "../ui/Text";
import ForgotPassword from "./ForgotPassword";
import { ConditionalRender } from "../ui/ConditionalRender";
import Tabs from "../ui/Tabs";
import LoginForm from "./LoginForm";
import { useToast } from "@/hooks/useToast";
import { returnBottomPromptLabel, returnBottomPropt } from "@/utils/auth";
import RegisterForm from "./RegisterForm";

export interface IUserCredentials {
  email: string;
  password: string;
}

export interface ICredentialsErrors {
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
  validPassword?: boolean;
}

interface ILoginProps {
  onLogin: (user: IUser) => void;
}

export default function Login({ onLogin }: ILoginProps) {
  const { text, colors, layout, spacing } = useStyles();
  const { height, width } = useWindowDimensions();
  const { triggerSuccessToast } = useToast();

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const registerText = returnBottomPropt(isRegistering, isChangingPassword);

  const loginTabs = [
    { label: "התחברות", value: false },
    { label: "חשבון חדש", value: true },
  ];

  const handleChangePasswordSuccess = () => {
    setIsForgotPassword(false);
    setIsChangingPassword(false);
    triggerSuccessToast({ message: `סיסמה עודכנה בהצלחה` });
  };

  const handleClickRegister = () => {
    setIsRegistering(true);
    setIsChangingPassword(false);
    setIsForgotPassword(false);
  };

  const handleBackPress = () => {
    setIsRegistering(false);
    setIsForgotPassword(false);
    setIsChangingPassword(false);
    setIsForgotPassword(false);
  };

  const bottomPromptHandler =
    isRegistering || isChangingPassword ? handleBackPress : handleClickRegister;

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View
        style={[
          layout.justifyEnd,
          layout.itemsCenter,
          spacing.gapXl,
          Platform.OS == "ios" && spacing.pdBottomBar,
          { height: height, width: width },
        ]}
      >
        <Image source={appIcon} style={styles.logo} />

        <KeyboardAvoidingView
          behavior="padding"
          style={[{ zIndex: 30, width: width * 0.9 }, spacing.gapXxl, spacing.pdSm]}
        >
          <ConditionalRender condition={!isForgotPassword}>
            <Tabs
              items={loginTabs}
              value={isRegistering}
              setValue={(val) => setIsRegistering(val)}
            />
          </ConditionalRender>

          <ConditionalRender condition={!isRegistering && !isForgotPassword}>
            <LoginForm
              onForgotPasswordPress={() => {
                setIsForgotPassword(true);
                setIsChangingPassword(true);
              }}
              onLoginSuccess={(user) => onLogin(user)}
            />
          </ConditionalRender>

          <ConditionalRender condition={isForgotPassword}>
            <ForgotPassword
              onBackPress={handleBackPress}
              onConfirmChangePasswordSuccess={handleChangePasswordSuccess}
            />
          </ConditionalRender>

          <ConditionalRender condition={isRegistering}>
            <RegisterForm />
          </ConditionalRender>

          <View style={[layout.flexRow, layout.center, spacing.gapSm, { zIndex: 30 }]}>
            <Text style={[colors.textPrimary]}>{registerText}</Text>

            <TouchableOpacity onPress={bottomPromptHandler}>
              <Text style={[colors.textPrimary, text.textBold]}>
                {returnBottomPromptLabel(isRegistering, isChangingPassword)}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  logo: { height: 64, width: 60, position: "absolute", top: 80 },
});
