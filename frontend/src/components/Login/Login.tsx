import {
  View,
  TouchableOpacity,
  Keyboard,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import avihuBg from "@assets/avihuFlyTrap.jpeg";
import { testEmail } from "@/utils/utils";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import useTextStyles from "@/styles/useTextStyles";
import { useAppTheme } from "@/themes/useAppTheme";
import useFontSize from "@/styles/useFontSize";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import useCommonStyles from "@/styles/useCommonStyles";

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
  const theme = useAppTheme();
  const textStyles = useTextStyles();
  const fontSize = useFontSize();
  const layoutStyles = useLayoutStyles();
  const commonStyles = useCommonStyles();

  const hardcodedUser: IUserCredentials = {
    email: `avihu123@gmail.com`,
    password: `qwerty123`,
  };

  const { setItem } = useAsyncStorage("isLoggedIn");

  const [inputtedCrendentials, setInputtedCredentials] = useState<IUserCredentials>({
    email: ``,
    password: ``,
  });
  const [status, setStatus] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<ICredentialsErrors>({});
  const [didSucceed, setDidSucceed] = useState<boolean>();

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

    if (hardcodedUser.email === email && hardcodedUser.password === password) {
      setStatus(`התחברות בוצעה בהצלחה`);
      setDidSucceed(true);
      setItem("true");
      setIsLoggedIn(true);
    } else {
      setStatus(`התחברות נכשלה!`);
      setDidSucceed(false);
    }
  };

  console.log("theme colors", theme.colors.onPrimary);
  return (
    <View style={[layoutStyles.fullSize, layoutStyles.center]}>
      <ImageBackground source={avihuBg} className="w-full h-full flex-2 absolute z-0" />
      <View className=" w-full h-full absolute top-0 left-0 bg-black opacity-55 z-10"></View>
      <KeyboardAvoidingView behavior="padding" className=" items-center z-30">
        <Text
          style={[
            textStyles.textPrimary,
            textStyles.textBold,
            commonStyles.paddingLarge,
            fontSize.xxl,
          ]}
        >
          כניסה לחשבון
        </Text>
        <View className=" w-80">
          <View>
            <TextInput
              style={{ width: "100%" }}
              placeholder="Email..."
              keyboardType={Platform.OS == "android" ? "email-address" : "default"}
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
            <Text style={textStyles.textDanger}>{formErrors.email}</Text>
          </View>
          <View>
            <TextInput
              style={{ width: "100%" }}
              placeholder="Password..."
              secureTextEntry={!showPassword}
              onChangeText={(val) =>
                setInputtedCredentials({ ...inputtedCrendentials, password: val })
              }
              right={
                <TextInput.Icon
                  onPress={() => setShowPassword((show) => !show)}
                  icon={showPassword ? "eye-off" : "eye"}
                />
              }
            />
            <Text style={textStyles.textDanger}>{formErrors.password}</Text>
          </View>
          <TouchableOpacity style={layoutStyles.fullWidth}>
            <Text style={[textStyles.textRight, textStyles.textPrimary, textStyles.textUnderline]}>
              הרשמה
            </Text>
          </TouchableOpacity>
        </View>
        <Button
          style={{ backgroundColor: theme.colors.primary }}
          mode="contained"
          onPress={handleSubmit}
        >
          התחברות
        </Button>
        {didSucceed ? (
          <Text className="text-emerald-300 text-lg">{status}</Text>
        ) : (
          <Text className="text-red-700 text-lg">{status}</Text>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  registerBtn: {
    textAlign: "right",
    textDecorationLine: "underline",
  },
});
