import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import React, { useState } from "react";
import avihuFlyTrap from "@assets/avihuFlyTrap.jpeg";
import { testEmail } from "@/utils/utils";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { Button, Text, TextInput } from "react-native-paper";
import useStyles from "@/styles/useGlobalStyles";
import { moderateScale } from "react-native-size-matters";

interface IUserCredentials {
  email: string;
  password: string;
}

interface ICredentialsErrors {
  email?: string;
  password?: string;
}

interface ILoginProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Login({ setIsLoggedIn }: ILoginProps) {
  const { text, colors, fonts, layout, spacing } = useStyles();

  const { height, width } = useWindowDimensions();

  const { setItem } = useAsyncStorage("isLoggedIn");

  const [inputtedCrendentials, setInputtedCredentials] = useState<IUserCredentials>({
    email: ``,
    password: ``,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<ICredentialsErrors>({});

  const handleSubmit = () => {
    const { email, password } = inputtedCrendentials;
    const errors: ICredentialsErrors = {};

    Keyboard.dismiss();

    if (!testEmail(email)) {
      errors[`email`] = `אנא הכניסו כתובת מייל תקינה`;
    }

    if (!password) {
      errors[`password`] = `אנא הזינו סיסמא`;
    }

    if (errors[`email`] || errors[`password`]) {
      setFormErrors(errors);
      return;
    }

    //handle api call

    /*  setItem("true");
      setIsLoggedIn(true); */
  };

  return (
    <View style={[layout.center, { height: height, width: width }]}>
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
        <View style={[layout.widthFull]}>
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
            />
            <Text style={[text.textDanger, text.textRight]}>{formErrors.email}</Text>
          </View>
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
          <TouchableOpacity>
            <Text style={[text.textRight, text.textPrimary, text.textUnderline]}>הרשמה</Text>
          </TouchableOpacity>
        </View>
        <Button mode="contained" onPress={handleSubmit}>
          התחברות
        </Button>
      </KeyboardAvoidingView>
    </View>
  );
}
