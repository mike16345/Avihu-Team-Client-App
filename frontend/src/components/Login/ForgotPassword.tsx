import { View, BackHandler, TouchableOpacity, useAnimatedValue, Animated } from "react-native";
import { FC, useEffect, useState } from "react";
import { useOTPApi } from "@/hooks/api/useOTPApi";
import useStyles from "@/styles/useGlobalStyles";
import { Button } from "react-native-paper";
import { showAlert, testEmail, testPassword } from "@/utils/utils";
import { INVALID_PASSWORD, INVALID_PASSWORD_MATCH, NO_PASSWORD } from "@/constants/Constants";
import ConfirmPassword from "./ConfirmPassword";
import { usePasswordsApi } from "@/hooks/api/usePasswordsApi";
import { ICredentialsErrors } from "./Login";
import { Text } from "../ui/Text";
import Loader from "../ui/loaders/Loader";
import { useUserApi } from "@/hooks/api/useUserApi";
import TextInput from "../ui/Input";
import { ApiResponse } from "@/types/ApiTypes";
import { IUser } from "@/interfaces/User";

interface IForgotPassword {
  email: string;
  onConfirmChangePasswordSuccess: () => void;
  onShowingOtpInputs?: () => void;
  onOTPConfirmed: () => void;
  isRegistering?: boolean;
  onBackPress: () => void;
  onEmailFail: () => void;
}

const ForgotPassword: FC<IForgotPassword> = ({
  email,
  onConfirmChangePasswordSuccess,
  onShowingOtpInputs,
  onOTPConfirmed,
  onEmailFail,
  isRegistering = false,
  onBackPress,
}) => {
  const { getOTP, validateOTP } = useOTPApi();
  const { changePassword } = usePasswordsApi();
  const { registerUser, checkEmailAccess } = useUserApi();

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

  const checkUserAccess = async () => {
    try {
      const res = await checkEmailAccess(email);

      return res;
    } catch (error: any) {
      if (error?.response?.data?.message) {
        showAlert("error", error.response.data.message);
      }
      return false;
    }
  };

  const handleGetOtp = async () => {
    const formattedEmail = email.toLowerCase().trim();

    if (!testEmail(formattedEmail)) {
      onEmailFail();
      return;
    }

    let response: boolean | ApiResponse<{ user: IUser; hasPassword: boolean }> = true;

    try {
      setIsLoading(true);
      if (isRegistering) {
        response = await checkUserAccess();
      }

      if (typeof response !== "boolean" && response.data.hasPassword) {
        showAlert("info", "משתמש כבר קיים במערכת!");
        handleBackPress();
        return;
      }

      await getOTP(formattedEmail);
      setShowOtpInput(true);
      onShowingOtpInputs?.();
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
      onOTPConfirmed();
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["otp"]: "קוד שגוי" });
    } finally {
      setIsLoading(false);
    }
  };

  const fadeValue = useAnimatedValue(0);

  const handleBackPress = () => {
    onBackPress();
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

  useEffect(() => {
    if (!isRegistering) return;
    setShowOtpInput(false);
    setIsOtpConfirmed(false);
  }, [isRegistering]);

  if (isLoading) return <Loader />;

  return (
    <View>
      {!showOtpInput && (
        <View style={[layout.center, layout.widthFull]}>
          <Button
            mode="contained"
            style={[common.rounded, { width: 250 }]}
            textColor={colors.textOnBackground.color}
            onPress={handleGetOtp}
          >
            <Text style={[text.textBold]}>שלח קוד אימות</Text>
          </Button>
        </View>
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
                style={[text.textCenter]}
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
          <View style={[layout.center]}>
            <Button
              mode="contained"
              style={[common.rounded, { width: 250 }]}
              textColor={colors.textOnBackground.color}
              onPress={handleConfirmPasswordChange}
            >
              <Text style={[text.textBold]}>מאשר סיסמה חדשה</Text>
            </Button>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default ForgotPassword;
