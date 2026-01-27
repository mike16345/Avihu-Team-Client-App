import { View, BackHandler, TouchableOpacity } from "react-native";
import { FC, useEffect, useState } from "react";
import { useOTPApi } from "@/hooks/api/useOTPApi";
import useStyles from "@/styles/useGlobalStyles";
import { testEmail } from "@/utils/utils";
import ConfirmPassword from "./ConfirmPassword";
import { usePasswordsApi } from "@/hooks/api/usePasswordsApi";
import { ICredentialsErrors } from "./Login";
import { Text } from "../ui/Text";
import Input from "../ui/inputs/Input";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import { ConditionalRender } from "../ui/ConditionalRender";
import { useToast } from "@/hooks/useToast";
import Animated, { FadeIn } from "react-native-reanimated";

interface IForgotPassword {
  onConfirmChangePasswordSuccess: () => void;
  onBackPress: () => void;
}

const ForgotPassword: FC<IForgotPassword> = ({ onConfirmChangePasswordSuccess, onBackPress }) => {
  const { getOTP, validateOTP } = useOTPApi();
  const { changePassword } = usePasswordsApi();
  const { triggerErrorToast } = useToast();

  const { layout, colors, spacing, text } = useStyles();

  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState<ICredentialsErrors & { otp?: boolean }>({});
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isOtpConfirmed, setIsOtpConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmPasswordChange = async () => {
    if (!password) {
      setFormErrors({ ...formErrors, ["password"]: true });
      return;
    }

    if (confirmPassword !== password) {
      setFormErrors({ ...formErrors, ["confirmPassword"]: true });
      return;
    }

    try {
      setIsLoading(true);

      await changePassword(email, password, sessionId);

      onConfirmChangePasswordSuccess();
    } catch (error: any) {
      triggerErrorToast({ message: error?.response?.data?.message });
      setFormErrors({ ...formErrors, ["password"]: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetOtp = async () => {
    const formattedEmail = email.toLowerCase().trim();

    if (!testEmail(formattedEmail)) {
      setFormErrors({ ...formErrors, ["email"]: true });
      return;
    }

    try {
      setIsLoading(true);

      await getOTP(formattedEmail);
      setShowOtpInput(true);
    } catch (error: any) {
      triggerErrorToast({ message: error?.response?.data?.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async () => {
    if (!otp || otp.length !== 6) {
      setFormErrors({ ...formErrors, ["otp"]: true });
      return;
    }

    try {
      setIsLoading(true);
      const sessionId = (await validateOTP(email, otp))?.data?.changePasswordSessionId || "";
      setSessionId(sessionId);
      setIsOtpConfirmed(true);
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["otp"]: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    onBackPress();
    setShowOtpInput(false);
    setIsOtpConfirmed(false);
    setFormErrors({});
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <Animated.View entering={FadeIn.duration(500)} style={[spacing.gapXl]}>
      <ConditionalRender condition={!showOtpInput}>
        <Input
          label="אימייל"
          placeholder="הכנס אימייל"
          keyboardType={"email-address"}
          autoCorrect={false}
          autoComplete="email"
          error={formErrors.email}
          textContentType="emailAddress"
          onChangeText={(val) => setEmail(val)}
          value={email}
        />
      </ConditionalRender>

      <ConditionalRender condition={!showOtpInput}>
        <PrimaryButton block onPress={handleGetOtp} loading={isLoading}>
          שלח לי קוד אימות
        </PrimaryButton>
      </ConditionalRender>

      <ConditionalRender condition={showOtpInput && !isOtpConfirmed}>
        <>
          <View style={[spacing.gapXl]}>
            <Input
              label="קוד אימות"
              style={[text.textCenter]}
              placeholder="קוד אימות בעל 6 ספרות"
              error={formErrors["otp"]}
              keyboardType="numeric"
              maxLength={6}
              textContentType="oneTimeCode"
              onChangeText={(val) => setOtp(val)}
              value={otp}
            />

            <View style={[layout.flexRow, spacing.gapDefault, layout.justifyCenter]}>
              <Text>לא קיבלתם את הקוד?</Text>
              <TouchableOpacity onPress={() => getOTP(email)}>
                <Text style={[colors.textPrimary, text.textBold]}>לחץ כאן</Text>
              </TouchableOpacity>
            </View>

            <PrimaryButton onPress={handleValidateOtp} loading={isLoading} block>
              הבא
            </PrimaryButton>
          </View>
        </>
      </ConditionalRender>

      <ConditionalRender condition={isOtpConfirmed}>
        <View style={spacing.gapXl}>
          <ConfirmPassword
            errors={formErrors}
            handlePasswordChange={(val) => setPassword(val)}
            handlePasswordConfirmChange={(val) => setConfirmPassword(val)}
          />

          <PrimaryButton block onPress={handleConfirmPasswordChange} loading={isLoading}>
            כניסה
          </PrimaryButton>
        </View>
      </ConditionalRender>
    </Animated.View>
  );
};

export default ForgotPassword;
