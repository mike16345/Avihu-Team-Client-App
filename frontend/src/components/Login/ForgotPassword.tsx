import { View, Text, BackHandler, Touchable, TouchableOpacity } from "react-native";
import { FC, useEffect, useState } from "react";
import { useOTPApi } from "@/hooks/api/useOTPApi";
import useStyles from "@/styles/useGlobalStyles";
import { Button, TextInput } from "react-native-paper";
import { testEmail } from "@/utils/utils";
import { EMAIL_ERROR, INVALID_PASSWORD_MATCH } from "@/constants/Constants";
import ConfirmPassword from "./ConfirmPassword";
import { usePasswordsApi } from "@/hooks/api/usePasswordsApi";
import { ICredentialsErrors } from "./Login";

interface IForgotPassword {
  onConfirmChangePasswordSuccess: () => void;
}

const ForgotPassword: FC<IForgotPassword> = ({ onConfirmChangePasswordSuccess }) => {
  const { getOTP, validateOTP } = useOTPApi();
  const { changePassword } = usePasswordsApi();

  const { colors, spacing, layout, text } = useStyles();

  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState<ICredentialsErrors & { otp?: string }>({});
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isOtpConfirmed, setIsOtpConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionId, setSessionId] = useState("");

  const handleConfirmPasswordChange = async () => {
    if (confirmPassword !== password) {
      setFormErrors({ ...formErrors, ["confirmPassword"]: INVALID_PASSWORD_MATCH });
      return;
    }

    try {
      await changePassword(email, password, sessionId);
      onConfirmChangePasswordSuccess();
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["password"]: error?.response?.data?.message });
    }
  };

  const handleGetOtp = async () => {
    if (!testEmail(email)) {
      setFormErrors({ ...formErrors, ["email"]: EMAIL_ERROR });
      return;
    }

    try {
      const res = await getOTP(email!);
      console.log(JSON.stringify(res, undefined, 2));
      setShowOtpInput(true);
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["otp"]: error?.response?.data?.message });
    }
  };

  const handleValidateOtp = async () => {
    if (!otp || otp.length !== 6) {
      setFormErrors({ ...formErrors, ["otp"]: "Please enter a valid 6-digit OTP." });
      return;
    }

    try {
      const sessionId = (await validateOTP(email, otp))?.data?.changePasswordSessionId || "";
      setSessionId(sessionId);
      setIsOtpConfirmed(true);
    } catch (error: any) {
      setFormErrors({ ...formErrors, ["otp"]: error?.response?.data?.message });
    }
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => {
      console.log("Back button pressed");
      return true;
    });
  }, []);

  return (
    <View style={[]}>
      {!showOtpInput && (
        <>
          <Text
            style={[text.textRight, spacing.pdHorizontalXs, colors.textOnBackground, text.textBold]}
          >
            כתובת מייל
          </Text>
          <TextInput
            style={[{ width: "100%" }, text.textLeft, colors.background]}
            mode="outlined"
            activeOutlineColor={colors.borderSecondary.borderColor}
            placeholder="user@example.com"
            keyboardType={"email-address"}
            autoCorrect={false}
            autoComplete="email"
            error={!!formErrors.email}
            textContentType="emailAddress"
            onChangeText={(val) => setEmail(val)}
            value={email}
          />
          <Text style={[text.textDanger, text.textRight, text.textBold]}>
            {formErrors["email"]}
          </Text>
          <Button onPress={handleGetOtp}>Get OTP</Button>
        </>
      )}
      {showOtpInput && !isOtpConfirmed && (
        <>
          <Text
            style={[text.textRight, spacing.pdHorizontalXs, colors.textOnBackground, text.textBold]}
          >
            קוד אימות
          </Text>
          <View style={[spacing.gapLg]}>
            <View>
              <TextInput
                style={[{ width: "100%" }, text.textLeft, colors.background]}
                mode="outlined"
                activeOutlineColor={colors.borderSecondary.borderColor}
                placeholder="Enter 6-digit OTP"
                keyboardType="numeric"
                maxLength={6}
                textContentType="oneTimeCode"
                onChangeText={(val) => setOtp(val)}
                value={otp}
              />
              <TouchableOpacity onPress={() => getOTP(email)}>
                <Text style={[colors.textInfo, text.textRight]}>תשלח חדש</Text>
              </TouchableOpacity>
              {formErrors["otp"] && (
                <Text style={[text.textDanger, text.textCenter, text.textBold]}>
                  {formErrors["otp"]}
                </Text>
              )}
            </View>

            <Button mode="contained" onPress={handleValidateOtp}>
              אישור
            </Button>
          </View>
        </>
      )}
      {isOtpConfirmed && (
        <View>
          <ConfirmPassword
            errors={formErrors}
            handlePasswordChange={(val) => setPassword(val)}
            handlePasswordConfirmChange={(val) => setConfirmPassword(val)}
          />
          <Button onPress={handleConfirmPasswordChange}>Change Password</Button>
        </View>
      )}
    </View>
  );
};

export default ForgotPassword;
