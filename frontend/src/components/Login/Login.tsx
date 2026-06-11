import {
  View,
  Keyboard,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import appIcon from "@assets/app-icon.png";
import useStyles from "@/styles/useGlobalStyles";
import { IUser } from "@/interfaces/User";
import { Text } from "../ui/Text";
import ForgotPassword from "./ForgotPassword";
import { ConditionalRender } from "../ui/ConditionalRender";
import LoginForm from "./LoginForm";
import { useToast } from "@/hooks/useToast";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { useSharedValue, Easing, withTiming } from "react-native-reanimated";

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

  const translateY = useSharedValue(0);

  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleChangePasswordSuccess = () => {
    setIsForgotPassword(false);
    triggerSuccessToast({ message: `סיסמה עודכנה בהצלחה` });
  };

  const handleBackPress = () => {
    setIsForgotPassword(false);
    setIsForgotPassword(false);
  };

  useEffect(() => {
    Keyboard.addListener("keyboardWillShow", () => {
      translateY.value = withTiming(-500, {
        duration: 200,
        easing: Easing.linear,
      });
    });

    Keyboard.addListener("keyboardWillHide", () => {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.linear,
      });
    });

    return () => {
      Keyboard.removeAllListeners("keyboardWillShow");
      Keyboard.removeAllListeners("keyboardWillHide");
    };
  }, []);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View
        style={[
          layout.justifyBetween,
          layout.itemsCenter,
          spacing.gapXl,
          Platform.OS == "ios" && spacing.pdBottomBar,
          !isForgotPassword && { paddingBottom: 80 },
          { height: height, width: width },
        ]}
      >
        <Animated.View
          style={[
            layout.flex1,
            layout.justifyStart,
            { paddingTop: 48, transform: [{ translateY }] },
          ]}
        >
          <Image source={appIcon} style={styles.logo} />
        </Animated.View>

        <KeyboardAvoidingView
          behavior="padding"
          style={[{ zIndex: 30, width: width * 0.9 }, spacing.gapXxl, spacing.pdSm]}
        >
          <ConditionalRender condition={!isForgotPassword}>
            <LoginForm
              onForgotPasswordPress={() => {
                setIsForgotPassword(true);
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

          <ConditionalRender condition={isForgotPassword}>
            <View
              style={[
                layout.flexRow,
                layout.center,
                spacing.gapSm,
                { zIndex: 30, paddingBottom: 32 },
              ]}
            >
              <Text fontSize={16} style={[colors.textPrimary]}>
                נזכרתם?
              </Text>

              <TouchableOpacity onPress={handleBackPress}>
                <Text
                  fontVariant="semibold"
                  fontSize={16}
                  style={[colors.textPrimary, text.textBold]}
                >
                  התחברו
                </Text>
              </TouchableOpacity>
            </View>
          </ConditionalRender>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  logo: { height: 64, width: 60 },
});
