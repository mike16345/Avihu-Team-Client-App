import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  useWindowDimensions,
  Animated,
  useAnimatedValue,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import appIcon from "@assets/app-icon.png";
import { showAlert } from "@/utils/utils";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
import { useUserApi } from "@/hooks/api/useUserApi";
import Loader from "../ui/loaders/Loader";
import { IUser } from "@/interfaces/User";
import { Text } from "../ui/Text";
import ForgotPassword from "./ForgotPassword";
import { EMAIL_ERROR, NO_ACCESS, NO_PASSWORD } from "@/constants/Constants";
import { ConditionalRender } from "../ui/ConditionalRender";
import { useUserStore } from "@/store/userStore";
import { SESSION_TOKEN_KEY } from "@/constants/reactQuery";
import Tabs from "../ui/Tabs";
import LoginForm from "./LoginForm";

export interface IUserCredentials {
  email: string;
  password: string;
}

export interface ICredentialsErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  validPassword?: string;
}

interface ILoginProps {
  onLogin: (user: IUser) => void;
}

export default function Login({ onLogin }: ILoginProps) {
  const { text, colors, layout, spacing, common, fonts } = useStyles();
  const { height, width } = useWindowDimensions();

  const [inputtedCrendentials, setInputtedCredentials] = useState<IUserCredentials>({
    email: ``,
    password: ``,
  });
  const [formErrors, setFormErrors] = useState<ICredentialsErrors>({});
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isShowingOtpInputs, setIsShowingOtpInputs] = useState(false);
  const [showConfirmButton, setShowConfirmButton] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const registerText = isRegistering ? "יש לך חשבון?" : "אין לך עדיין חשבון?";

  const loginTabs = [
    { label: "התחברות", value: false },
    { label: "חשבון חדש", value: true },
  ];

  const emailInputY = useAnimatedValue(0);

  const handleChangePasswordSuccess = () => {
    setIsRegistering(false);
    setIsForgotPassword(false);
    setIsChangingPassword(false);
    setShowConfirmButton(true);
    setIsShowingOtpInputs(false);
    showAlert("success", `סיסמה עודכנה בהצלחה`);
  };

  const handleClickRegister = () => {
    setIsRegistering(true);
    setIsChangingPassword(false);
    setIsForgotPassword(false);
    setShowConfirmButton(false);
  };

  const showPasswordInputs = (show: boolean) => {
    if (!show) {
      setIsForgotPassword(false);
      setShowConfirmButton(true);
    } else {
      setIsForgotPassword(true);
      setShowConfirmButton(false);
    }
  };

  const handleBackPress = () => {
    setIsRegistering(false);
    setIsForgotPassword(false);
    setIsChangingPassword(false);
    showPasswordInputs(false);
  };

  useEffect(() => {
    if (isForgotPassword) {
      if (isShowingOtpInputs) {
        Animated.timing(emailInputY, {
          toValue: -30,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(emailInputY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    } else {
      Animated.timing(emailInputY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isForgotPassword, isShowingOtpInputs]);

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
        {loading && <Loader variant="Screen" />}

        <Image source={appIcon} style={{ height: 64, width: 60, position: "absolute", top: 80 }} />

        <KeyboardAvoidingView
          behavior="padding"
          style={[{ zIndex: 30, width: width * 0.9 }, spacing.gapXxl, spacing.pdSm]}
        >
          <Tabs items={loginTabs} value={isRegistering} setValue={(val) => setIsRegistering(val)} />

          <View style={[layout.widthFull, spacing.gapXl]}>
            <ConditionalRender condition={!isRegistering && !isForgotPassword}>
              <LoginForm
                onForgotPasswordPress={() => setIsForgotPassword(true)}
                onLoginSuccess={(user) => onLogin(user)}
              />
            </ConditionalRender>

            <ConditionalRender condition={isForgotPassword}>
              <Button
                mode="text"
                onPress={() => {
                  handleBackPress();
                  showPasswordInputs(false);
                }}
              >
                <Text style={[colors.textPrimary, text.textCenter, text.textBold]}>
                  לא חשוב, נזכרתי
                </Text>
              </Button>
            </ConditionalRender>

            <ConditionalRender condition={isForgotPassword || isRegistering}>
              <ForgotPassword
                onEmailFail={() =>
                  setFormErrors((prev) => {
                    return { ...prev, ["email"]: EMAIL_ERROR };
                  })
                }
                isRegistering={isRegistering}
                onBackPress={handleBackPress}
                email={inputtedCrendentials.email}
                onConfirmChangePasswordSuccess={handleChangePasswordSuccess}
                onShowingOtpInputs={() => setIsShowingOtpInputs(true)}
                onOTPConfirmed={() => setIsChangingPassword(true)}
              />
            </ConditionalRender>
          </View>
        </KeyboardAvoidingView>

        <View style={[layout.flexRow, layout.center, spacing.gapSm, { zIndex: 30 }]}>
          <Text style={[colors.textPrimary]}>{registerText}</Text>

          <TouchableOpacity onPress={!isRegistering ? handleClickRegister : handleBackPress}>
            <Text style={[colors.textPrimary, text.textBold]}>
              {isRegistering ? "התחבר" : "הרשמה"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
