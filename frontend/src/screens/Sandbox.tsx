import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";

import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import IconButton from "@/components/ui/buttons/IconButton";

import TextInput from "@/components/ui/Input";
import { useState } from "react";
import ChatInput from "@/components/ui/chat/ChatInput";
import Input from "@/components/ui/Input";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();

  const { getExerciseMethodByName } = useExerciseMethodApi();

  const [loading, setLoading] = useState(false);

  const get = async () => {
    setLoading(true);
    try {
      await getExerciseMethodByName("אימון פוקוס על כוח שיא (Max Effort)");
    } catch (error) {
      throw error; //throwing error is important for internal try catch to work in asyncWrapper
    } finally {
      setLoading(false);
    }
  };

  const [value, setValue] = useState(undefined);

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdDefault,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
        { direction: "rtl" },
      ]}
    >
      <Text style={[colors.textPrimary]}>{value || "type to change me"}</Text>

      <Input onChangeText={(val) => setValue(val)} placeholder="Michael touch me" />

      <ChatInput placeholder="im the chat bot fam" onChangeText={(val) => setValue(val)} />
    </View>
  );
};

export default Sandbox;
