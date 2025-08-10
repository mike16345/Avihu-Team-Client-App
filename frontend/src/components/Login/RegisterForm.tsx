import { View } from "react-native";
import React, { useState } from "react";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import Input from "../ui/inputs/Input";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import { testEmail, testPhone } from "@/utils/utils";

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
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const [newUserDetails, setNewUserDetails] = useState<INewUserDetails>({
    name: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<IFormErrors>({});

  const handleTextChange = <K extends keyof INewUserDetails>(key: K, value: INewUserDetails[K]) => {
    setNewUserDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    const { email, name, phone } = newUserDetails;

    const errors: IFormErrors = {};

    if (!name) {
      errors["name"] = true;
    }

    if (!testEmail(email)) {
      errors["email"] = true;
    }

    if (!testPhone(phone)) {
      errors["phone"] = true;
    }

    setFormErrors(errors);

    if (Object.keys(errors).length !== 0) return;

    console.log("yay no error");
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

      <PrimaryButton block onPress={handleSubmit}>
        שלח
      </PrimaryButton>
    </View>
  );
};

export default RegisterForm;
