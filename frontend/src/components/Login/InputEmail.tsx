import useStyles from "@/styles/useGlobalStyles";
import React, { useState } from "react";
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import avihuFlyTrap from "@assets/avihuFlyTrap.jpeg";
import { useUserApi } from "@/hooks/api/useUserApi";

const InputEmail = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { height, width } = useWindowDimensions();
  const { checkEmailAccess } = useUserApi();

  const [email, setEmail] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!email) return;

    checkEmailAccess(email)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
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
        <View style={[layout.widthFull, spacing.pdVerticalLg]}>
          <View>
            <TextInput
              style={[text.textRight, { width: "100%" }]}
              placeholder="כתובת מייל..."
              keyboardType={"email-address"}
              autoCorrect={false}
              autoComplete="email"
              textContentType="oneTimeCode"
              onChangeText={(val) => setEmail(val.toLocaleLowerCase())}
              value={email || ""}
            />
          </View>
        </View>
        <Button mode="contained" onPress={handleSubmit}>
          התחברות
        </Button>
      </KeyboardAvoidingView>
    </View>
  );
};

export default InputEmail;
