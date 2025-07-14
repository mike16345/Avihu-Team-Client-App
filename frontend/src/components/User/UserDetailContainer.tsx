import React from "react";
import { View } from "react-native";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { TextInput } from "react-native-paper";

interface UserDetailContainerProps {
  label: string;
  value: string;
}

const UserDetailContainer: React.FC<UserDetailContainerProps> = ({ label, value }) => {
  const { colors, spacing, text, fonts } = useStyles();
  
  return (
    <View style={[spacing.pdSm, spacing.gapDefault]}>
      <Text style={[text.textRight, text.textBold, colors.textOnBackground]}>{label}</Text>
      <TextInput
        mode="outlined"
        value={value}
        editable={false}
        style={[text.textCenter, colors.backdrop, fonts.md]}
        outlineColor={colors.backdrop.backgroundColor}
      />
    </View>
  );
};

export default UserDetailContainer;
