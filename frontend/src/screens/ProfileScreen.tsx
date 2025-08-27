import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import useLogout from "@/hooks/useLogout";
import { Text } from "@/components/ui/Text";
import { RootStackParamList, StackNavigatorProps } from "@/types/navigatorTypes";
import ProfileHeading from "@/components/User/ProfileHeading";
import UserDetailsWrapper from "@/components/User/UserDetailsWrapper";
import { ScrollView } from "react-native";

export type ProfileScreenProps = StackNavigatorProps<RootStackParamList, "Profile">;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ route, navigation }) => {
  const { layout, spacing } = useStyles();
  const { handleLogout } = useLogout();

  const onLogOut = async () => {
    await handleLogout();
    navigation?.navigate("LoginScreen");
  };

  return (
    <ScrollView
      style={[spacing.pdBottomBar, spacing.pdStatusBar]}
      contentContainerStyle={[layout.flex1, spacing.gapXl, spacing.pdLg]}
    >
      <ProfileHeading navigation={navigation} route={route} />

      <UserDetailsWrapper />

      <PrimaryButton block mode="light" onPress={onLogOut}>
        <Text fontVariant="bold">התנתק</Text>
      </PrimaryButton>
    </ScrollView>
  );
};

export default ProfileScreen;
