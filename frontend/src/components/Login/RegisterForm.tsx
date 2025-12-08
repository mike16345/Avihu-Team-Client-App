import { Keyboard } from "react-native";
import { useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import Input from "../ui/inputs/Input";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import { testEmail, testPhone } from "@/utils/utils";
import { useToast } from "@/hooks/useToast";
import { errorNotificationHaptic } from "@/utils/haptics";
import { useNavigation } from "@react-navigation/native";
import { AuthStackParamListNavigationProp } from "@/types/navigatorTypes";
import Animated, { FadeIn } from "react-native-reanimated";
import { useLeadsApi } from "@/hooks/api/useLeadsApi";

interface INewUserDetails {
  name: string;
  email: string;
  phone: string;
}

interface IFormErrors {
  name?: boolean;
  email?: boolean;
  phone?: boolean;
}

const DEFAULT_FORM_DATA = {
  name: "",
  email: "",
  phone: "",
};

const RegisterForm = () => {
  const { spacing } = useStyles();
  const { create: submitLead } = useLeadsApi();
  const { triggerErrorToast } = useToast();
  const navigation = useNavigation<AuthStackParamListNavigationProp>();

  const [newUserDetails, setNewUserDetails] = useState<INewUserDetails>(DEFAULT_FORM_DATA);
  const [formErrors, setFormErrors] = useState<IFormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleTextChange = <K extends keyof INewUserDetails>(key: K, value: INewUserDetails[K]) => {
    setNewUserDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    const { email, name, phone } = newUserDetails;

    const formattedEmail = email.toLowerCase().trim();
    const errors: IFormErrors = {};

    if (!name) {
      errors["name"] = true;
    }

    if (!testEmail(formattedEmail)) {
      errors["email"] = true;
    }

    if (!testPhone(phone)) {
      errors["phone"] = true;
    }

    setFormErrors(errors);

    if (Object.keys(errors).length !== 0) return errorNotificationHaptic();

    Keyboard.dismiss();

    setLoading(true);

    try {
      await submitLead({ email: formattedEmail, fullName: name, phone });

      setNewUserDetails(DEFAULT_FORM_DATA);

      navigation.navigate("SuccessScreen", {
        title: "הפרטים נשמרו בהצלחה!",
        message: "ניצור איתך קשר בהקדם האפשרי",
      });
    } catch (error) {
      triggerErrorToast({ message: "שגיאה בשמירת הפרטים" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(500)} style={[spacing.gap20]}>
      <Input
        label="שם מלא"
        placeholder="הכנס שם מלא"
        onChangeText={(val) => handleTextChange("name", val)}
        error={formErrors.name}
        value={newUserDetails.name}
      />
      <Input
        label="אימייל"
        placeholder="הכנס אימייל"
        textContentType="emailAddress"
        onChangeText={(val) => handleTextChange("email", val)}
        error={formErrors.email}
        value={newUserDetails.email}
      />
      <Input
        label="מספר טלפון"
        placeholder="הכנס מספר טלפון"
        textContentType="telephoneNumber"
        onChangeText={(val) => handleTextChange("phone", val)}
        error={formErrors.phone}
        value={newUserDetails.phone}
      />

      <PrimaryButton block onPress={handleSubmit} loading={loading}>
        שלח
      </PrimaryButton>
    </Animated.View>
  );
};

export default RegisterForm;
