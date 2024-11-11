import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  KeyboardAvoidingView,
  useWindowDimensions,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import avihuFlyTrap from "@assets/avihuFlyTrap.jpeg";
import { testEmail } from "@/utils/utils";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { Button, Text, TextInput } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
import { moderateScale } from "react-native-size-matters";
import { useUserApi } from "@/hooks/api/useUserApi";
import Toast, { ToastType } from "react-native-toast-message";
import ConfirmPassword from "./ConfirmPassword";
import Loader from "../ui/loaders/Loader";

interface IUserCredentials {
  email: string;
  password: string;
}

export interface ICredentialsErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface ILoginProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Login({ setIsLoggedIn }: ILoginProps) {
  const { text, colors, fonts, layout, spacing, common } = useStyles();
  const { checkEmailAccess, registerUser, loginUser } = useUserApi();

  const { height, width } = useWindowDimensions();

  const { setItem } = useAsyncStorage("isLoggedIn");

  const [inputtedCrendentials, setInputtedCredentials] = useState<IUserCredentials>({
    email: ``,
    password: ``,
  });
  const [confirmPassword, setConfirmPassowrd] = useState<string>(``);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<ICredentialsErrors>({});
  const [emailChecked, setEmailchecked] = useState(false);
  const [userRegistered, setUserRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const showAlert = (type: ToastType, message: string) => {
    Toast.show({
      text1: message,
      autoHide: true,
      type: type,
      swipeable: true,
    });
  };

  const handleSubmit = () => {
    const { email, password } = inputtedCrendentials;
    const errors: ICredentialsErrors = {};

    Keyboard.dismiss();

    if (!testEmail(email)) {
      errors[`email`] = `אנא הכניסו כתובת מייל תקינה`;
    }

    if (emailChecked && !password) {
      errors[`password`] = `אנא הזינו סיסמא`;
    }

    if (emailChecked && password !== confirmPassword) {
      errors[`confirmPassword`] = `סיסמאות לא תואמות`;
    }

    if (errors[`email`] || errors[`password`] || (!userRegistered && errors[`confirmPassword`])) {
      setFormErrors(errors);
      return;
    }

    if (!emailChecked) {
      setLoading(true);
      checkEmailAccess(email)
        .then((res) => {
          showAlert("success", res.message);
          setEmailchecked(true);
          if (res.data.password) {
            setUserRegistered(true);
          }
        })
        .catch((err) => {
          showAlert("error", err.response.data.message);
        })
        .finally(() => setLoading(false));
    }

    if (emailChecked && !userRegistered) {
      setLoading(true);
      registerUser(email, password)
        .then((res) => {
          showAlert("success", res.message);
          setUserRegistered(true);
        })
        .catch((err) => {
          showAlert("error", err.response.data.message);
        })
        .finally(() => setLoading(false));
    }

    if (emailChecked && userRegistered) {
      setLoading(true);
      loginUser(email, password)
        .then((res) => {
          showAlert("success", res.message);
          setIsLoggedIn(true);
          setItem("true");
        })
        .catch((err) => {
          showAlert("error", err.response.data.message);
        })
        .finally(() => setLoading(false));
    }
  };

  const emailInputY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (emailChecked) {
      // Animate the email input to move upwards
      Animated.timing(emailInputY, {
        toValue: -60, // Move the email input up by 60 units
        duration: 300, // Duration of the animation
        useNativeDriver: true, // Use native driver for better performance
      }).start();
    } else {
      // Reset position when emailChecked is false
      Animated.timing(emailInputY, {
        toValue: 0, // Reset to original position
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [emailChecked]);

  return (
    <View style={[layout.center, { height: height, width: width }]}>
      {loading && <Loader variant="Screen" />}
      <ImageBackground
        source={avihuFlyTrap}
        style={[
          layout.center,
          layout.flex1,
          {
            width: moderateScale(350, 2),
            height: moderateScale(700, 2),
            zIndex: 0,
          },
        ]}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            colors.background,
            {
              position: `absolute`,
              top: 0,
              left: 0,
              zIndex: 10,
              opacity: 0.7,
              height: height,
              width: width,
            },
          ]}
        ></View>
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior="padding"
        style={[
          layout.center,
          spacing.gapDefault,
          { zIndex: 30, position: `absolute`, width: width * 0.7 },
        ]}
      >
        <Text style={[colors.textPrimary, text.textBold, spacing.pdLg, fonts.xxxl]}>
          כניסה לחשבון
        </Text>
        <View style={[layout.widthFull, spacing.gapXl]}>
          {!emailChecked ? (
            <View>
              <TextInput
                style={[text.textRight, { width: "100%" }]}
                placeholder="כתובת מייל..."
                keyboardType={"email-address"}
                autoCorrect={false}
                autoComplete="email"
                textContentType="oneTimeCode"
                onChangeText={(val) =>
                  setInputtedCredentials({
                    ...inputtedCrendentials,
                    email: val.toLocaleLowerCase().trim(),
                  })
                }
                value={inputtedCrendentials.email}
              />
              <Text style={[text.textDanger, text.textRight]}>{formErrors.email}</Text>
            </View>
          ) : (
            <Animated.View
              style={[spacing.pdDefault, colors.backgroundSecondaryContainer, common.rounded]}
            >
              <Text
                style={[
                  fonts.default,
                  text.textBold,
                  colors.textOnPrimaryContainer,
                  text.textCenter,
                  { transform: [{ translateY: emailInputY }] },
                ]}
              >
                {inputtedCrendentials.email}
              </Text>
            </Animated.View>
          )}
          {emailChecked && userRegistered && (
            <View>
              <TextInput
                style={[text.textRight, { width: "100%" }]}
                placeholder="סיסמא..."
                secureTextEntry={!showPassword}
                onChangeText={(val) =>
                  setInputtedCredentials({ ...inputtedCrendentials, password: val })
                }
                left={
                  <TextInput.Icon
                    onPress={() => setShowPassword((show) => !show)}
                    icon={showPassword ? "eye-off" : "eye"}
                  />
                }
              />
              <Text style={[text.textDanger, text.textRight]}>{formErrors.password}</Text>
            </View>
          )}
          {emailChecked && !userRegistered && (
            <ConfirmPassword
              errors={formErrors}
              handlePasswordChange={(val) =>
                setInputtedCredentials({ ...inputtedCrendentials, password: val })
              }
              handlePasswordConfirmChange={(val) => setConfirmPassowrd(val)}
            />
          )}
        </View>
        <Button mode="contained" onPress={handleSubmit}>
          התחברות
        </Button>
      </KeyboardAvoidingView>
    </View>
  );
}
