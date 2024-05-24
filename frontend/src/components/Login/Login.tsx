import {
  View,
  TouchableOpacity,
  Keyboard,
  ImageBackground,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Input } from "react-native-elements";
import avihuBg from "../../../assets/avihuFlyTrap.jpeg";
import { testEmail } from "../../utils/utils";
import NativeIcon from "../Icon/NativeIcon";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

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

  return (
    <View className="flex-1 w-screen justify-center  ">
      <ImageBackground source={avihuBg} className="w-full h-full flex-2 absolute z-0" />
      <View className=" w-full h-full absolute top-0 left-0 bg-black opacity-55 z-10"></View>
      <KeyboardAvoidingView behavior="padding" className="w-full gap-4 items-center z-30">
        <Text className="ios:text-5xl text-4xl text-center text-emerald-300 font-bold pb-8">
          כניסה לחשבון
        </Text>
        <View className=" items-center justify-center w-80">
          <Input
            placeholder="Email..."
            inputContainerStyle={{ borderBottomWidth: 0 }}
            className="inpt  "
            keyboardType={Platform.OS == "android" ? "email-address" : "default"}
            autoCorrect={false}
            autoComplete="email"
            errorMessage={formErrors[`email`]}
            textContentType="oneTimeCode"
            errorStyle={{ textAlign: "right" }}
            onChangeText={(val) =>
              setInputtedCredentials({
                ...inputtedCrendentials,
                email: val.toLocaleLowerCase().trim(),
              })
            }
          />
        </View>
        <View className="w-80">
          <Input
            placeholder="Password..."
            className="inpt "
            inputContainerStyle={{ borderBottomWidth: 0 }}
            errorMessage={formErrors[`password`]}
            errorStyle={{ textAlign: "right" }}
            secureTextEntry={!showPassword}
            textContentType="oneTimeCode"
            onChangeText={(val) =>
              setInputtedCredentials({ ...inputtedCrendentials, password: val })
            }
          />
          <NativeIcon
            onPress={() => setShowPassword((show) => !show)}
            library="MaterialCommunityIcons"
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            color={"black"}
            size={28}
            style={{ position: "absolute", zIndex: 10, top: 10, right: 20 }}
          />
        </View>
        <TouchableOpacity>
          <Text className="w-72 underline text-right text-emerald-300">הרשמה</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit}>
          <Text className="bg-emerald-300 text-center text-lg rounded-md py-2 w-72 font-bold">
            התחברות
          </Text>
        </TouchableOpacity>
        {didSucceed ? (
          <Text className="text-emerald-300 text-lg">{status}</Text>
        ) : (
          <Text className="text-red-700 text-lg">{status}</Text>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
