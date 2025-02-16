import { View, BackHandler, TouchableOpacity, useAnimatedValue, Animated } from "react-native";
import { FC, useEffect, useState } from "react";
import { useOTPApi } from "@/hooks/api/useOTPApi";
import useStyles from "@/styles/useGlobalStyles";
import { Button } from "react-native-paper";
import { testEmail, testPassword } from "@/utils/utils";
import {
  EMAIL_ERROR,
  INVALID_PASSWORD,
  INVALID_PASSWORD_MATCH,
  NO_PASSWORD,
} from "@/constants/Constants";
import ConfirmPassword from "./ConfirmPassword";
import { usePasswordsApi } from "@/hooks/api/usePasswordsApi";
import { ICredentialsErrors } from "./Login";
import { Text } from "../ui/Text";
import Loader from "../ui/loaders/Loader";
import { useUserApi } from "@/hooks/api/useUserApi";
import TextInput from "../ui/TextInput";

interface IForgotPassword {
  email: string;
  onConfirmChangePasswordSuccess: () => void;
  onShowingOtpInputs?: () => void;
  isRegistering?: boolean;
}

const ForgotPassword: FC<IForgotPassword> = ({
  email,
  onConfirmChangePasswordSuccess,
  onShowingOtpInputs,
  isRegistering = false,
}) => {
  const { getOTP, validateOTP } = useOTPApi();
  const { changePassword } = usePasswordsApi();
  const { registerUser } = useUserApi();

  const { layout, colors, spacing, text, common } = useStyles();

  const [formErrors, setFormErrors] = useState<ICredentialsErrors & { otp?: string }>({});
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isOtpConfirmed, setIsOtpConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmPasswordChange = async () => {
    if (!password) {
      setFormErrors({ ...formErrors, ["password"]: NO_PASSWORD });
      return;
    }
    if (!testPassword(password)) {
      setFormErrors({ ...formErrors, ["validPassword"]: INVALID_PASSWORD });
      return;
    }
    if (confirmPassword !== password) {
      setFormErrors({ ...formErrors, ["confirmPassword"]: INVALID_PASSWORD_MATCH });
      return;
    }

    try {
      setIsLoading(true);
      isRegistering
        ? await registerUser(email, password)
        : await changePassword(email, password, sessionId);

      onConfirmChangePasswordSuccess();
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["password"]: error?.response?.data?.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetOtp = async () => {
    if (!testEmail(email)) {
      setFormErrors({ ...formErrors, ["email"]: EMAIL_ERROR });
      return;
    }

    try {
      setIsLoading(true);
      const res = await getOTP(email!);
      console.log(JSON.stringify(res, undefined, 2));
      setShowOtpInput(true);

      if (!onShowingOtpInputs) return;
      onShowingOtpInputs();
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["otp"]: error?.response?.data?.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async () => {
    if (!otp || otp.length !== 6) {
      setFormErrors({ ...formErrors, ["otp"]: "קוד האימות חייב להיות בעל 6 ספרות" });
      return;
    }

    try {
      setIsLoading(true);
      const sessionId = (await validateOTP(email, otp))?.data?.changePasswordSessionId || "";
      setSessionId(sessionId);
      setIsOtpConfirmed(true);
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["otp"]: "קוד שגוי" });
    } finally {
      setIsLoading(false);
    }
  };

  const fadeValue = useAnimatedValue(0);

  useEffect(() => {
    if (showOtpInput) {
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [showOtpInput]);

  const handleBackPress = () => {
    console.log("handleBack");
    setShowOtpInput(false);
    setIsOtpConfirmed(false);
    setFormErrors({});
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, []);

  if (isLoading) return <Loader />;

  return (
    <View>
      {!showOtpInput && (
        <>
          <Button
            mode="contained"
            style={[common.rounded]}
            textColor={colors.textOnBackground.color}
            onPress={handleGetOtp}
          >
            שלח קוד אימות
          </Button>
        </>
      )}
      {showOtpInput && !isOtpConfirmed && (
        <Animated.View style={[{ opacity: fadeValue }, spacing.gapSm]}>
          <Text
            style={[text.textRight, spacing.pdHorizontalXs, colors.textOnBackground, text.textBold]}
          >
            קוד אימות
          </Text>
          <View style={[spacing.gapLg]}>
            <View style={[spacing.gapSm]}>
              <TextInput
                style={[{ height: 45 }, text.textCenter]}
                activeOutlineColor={colors.borderSecondary.borderColor}
                placeholder="קוד אימות בעל 6 ספרות"
                error={!!formErrors["otp"]}
                keyboardType="numeric"
                maxLength={6}
                textContentType="oneTimeCode"
                onChangeText={(val) => setOtp(val)}
                value={otp}
              />
              {formErrors["otp"] && (
                <Text style={[text.textDanger, text.textCenter, text.textBold]}>
                  {formErrors["otp"]}
                </Text>
              )}
              <TouchableOpacity onPress={() => getOTP(email)}>
                <Text style={[colors.textOnBackground, text.textUnderline, text.textRight]}>
                  לא קיבלתי, שלח שוב
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[layout.center]}>
              <Button
                mode="contained"
                style={[common.rounded, { width: 250 }]}
                textColor={colors.textOnBackground.color}
                onPress={handleValidateOtp}
              >
                צור סיסמה חדשה
              </Button>
            </View>
          </View>
        </Animated.View>
      )}
      {isOtpConfirmed && (
        <Animated.View style={{ opacity: fadeValue }}>
          <ConfirmPassword
            errors={formErrors}
            value={password}
            handlePasswordChange={(val) => setPassword(val)}
            handlePasswordConfirmChange={(val) => setConfirmPassword(val)}
          />
          <Button
            mode="contained"
            style={[common.rounded, spacing.mgHorizontalDefault]}
            textColor={colors.textOnBackground.color}
            onPress={handleConfirmPasswordChange}
          >
            <Text style={[text.textBold]}>מאשר סיסמה חדשה</Text>
          </Button>
        </Animated.View>
      )}
    </View>
  );
};

export default ForgotPassword;
