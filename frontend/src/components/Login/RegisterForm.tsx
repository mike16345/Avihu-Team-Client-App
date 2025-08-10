import { Keyboard, View } from "react-native";
import { useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import Input from "../ui/inputs/Input";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import { testEmail, testPhone } from "@/utils/utils";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useToast } from "@/hooks/useToast";

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

const RegisterForm = () => {
  const { spacing } = useStyles();
  const { submitLead } = useUserApi();
  const { triggerErrorToast } = useToast();

  const [newUserDetails, setNewUserDetails] = useState<INewUserDetails>({
    name: "",
    email: "",
    phone: "",
  });
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

    const errors: IFormErrors = {};

    if (!name) {
      errors["name"] = true;
    }

    if (!testEmail(email.trim())) {
      errors["email"] = true;
    }

    if (!testPhone(phone)) {
      errors["phone"] = true;
    }

    setFormErrors(errors);

    if (Object.keys(errors).length !== 0) return;

    Keyboard.dismiss();

    setLoading(true);

    try {
      await submitLead(email, name, phone);
    } catch (error) {
      triggerErrorToast({ message: "שגיאה בשמירת הפרטים" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={spacing.gapXl}>
      <Input
        label="שם מלא"
        placeholder="הכנס שם מלא"
        onChangeText={(val) => handleTextChange("name", val)}
        error={formErrors.name}
      />
      <Input
        label="אימייל"
        placeholder="הכנס אימייל"
        textContentType="emailAddress"
        onChangeText={(val) => handleTextChange("email", val.toLowerCase())}
        error={formErrors.email}
      />
      <Input
        label="מספר טלפון"
        placeholder="הכנס מספר טלפון"
        textContentType="telephoneNumber"
        onChangeText={(val) => handleTextChange("phone", val)}
        error={formErrors.phone}
      />

      <PrimaryButton block onPress={handleSubmit} loading={loading}>
        שלח
      </PrimaryButton>
    </View>
  );
};

export default RegisterForm;
