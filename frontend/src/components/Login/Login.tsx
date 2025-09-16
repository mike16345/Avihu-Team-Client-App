import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import appIcon from "@assets/app-icon.png";
import useStyles from "@/styles/useGlobalStyles";
import { IUser } from "@/interfaces/User";
import { Text } from "../ui/Text";
import ForgotPassword from "./ForgotPassword";
import { ConditionalRender } from "../ui/ConditionalRender";
import LoginForm from "./LoginForm";
import { useToast } from "@/hooks/useToast";
import { getRegisterOrLoginPrompt, getRegisterOrLoginPromptLabel } from "@/utils/auth";
import RegisterForm from "./RegisterForm";
import { Tabs, TabsList } from "../ui/Tabs";
import { useTabs } from "@/hooks/useTabs";

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

type TabNames = "התחברות" | "חשבון חדש";
interface ILoginProps {
  onLogin: (user: IUser) => void;
}

export default function Login({ onLogin }: ILoginProps) {
  const { text, colors, layout, spacing } = useStyles();
  const { height, width } = useWindowDimensions();
  const { triggerSuccessToast } = useToast();

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabNames>("התחברות");
  const isRegistering = selectedTab == "חשבון חדש";
  const registerOrLoginPrompt = getRegisterOrLoginPrompt(isRegistering, isChangingPassword);

  const { tabTriggers, tabContent } = useTabs([
    {
      label: "התחברות",
      value: "התחברות",
      content: (
        <LoginForm
          onForgotPasswordPress={() => {
            setIsForgotPassword(true);
            setIsChangingPassword(true);
          }}
          onLoginSuccess={(user) => onLogin(user)}
        />
      ),
    },
    {
      label: "חשבון חדש",
      value: "חשבון חדש",
      content: <RegisterForm />,
    },
  ]);

  const handleChangePasswordSuccess = () => {
    setIsForgotPassword(false);
    setIsChangingPassword(false);
    triggerSuccessToast({ message: `סיסמה עודכנה בהצלחה` });
  };

  const handleClickRegister = () => {
    setSelectedTab("חשבון חדש");
    setIsChangingPassword(false);
    setIsForgotPassword(false);
  };

  const handleBackPress = () => {
    setSelectedTab("התחברות");
    setIsForgotPassword(false);
    setIsChangingPassword(false);
    setIsForgotPassword(false);
  };

  const bottomPromptHandler =
    isRegistering || isChangingPassword ? handleBackPress : handleClickRegister;

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
          { height: height, width: width },
        ]}
      >
        <View style={[layout.flex1, layout.justifyCenter]}>
          <Image source={appIcon} style={styles.logo} />
        </View>

        <KeyboardAvoidingView
          behavior="padding"
          style={[{ zIndex: 30, width: width * 0.9 }, spacing.gapXxl, spacing.pdSm]}
        >
          <ConditionalRender condition={!isForgotPassword}>
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value)}>
              <View style={[spacing.gapDefault]}>
                <TabsList>{tabTriggers}</TabsList>
                {tabContent}
              </View>
            </Tabs>
          </ConditionalRender>

          <ConditionalRender condition={isForgotPassword}>
            <ForgotPassword
              onBackPress={handleBackPress}
              onConfirmChangePasswordSuccess={handleChangePasswordSuccess}
            />
          </ConditionalRender>

          <View style={[layout.flexRow, layout.center, spacing.gapSm, { zIndex: 30 }]}>
            <Text style={[colors.textPrimary]}>{registerOrLoginPrompt}</Text>

            <TouchableOpacity onPress={bottomPromptHandler}>
              <Text style={[colors.textPrimary, text.textBold]}>
                {getRegisterOrLoginPromptLabel(isRegistering, isChangingPassword)}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  logo: { height: 64, width: 60 },
});
