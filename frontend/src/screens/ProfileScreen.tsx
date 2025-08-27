import {
  Image,
  LayoutChangeEvent,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React, { useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { useUserStore } from "@/store/userStore";
import UserDetailContainer from "@/components/User/UserDetailContainer";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import useLogout from "@/hooks/useLogout";
import { Text } from "@/components/ui/Text";
import { RootStackParamList, StackNavigatorProps } from "@/types/navigatorTypes";
import ProfileHeading from "@/components/User/ProfileHeading";

export type ProfileScreenProps = StackNavigatorProps<RootStackParamList, "Profile">;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ route, navigation }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { currentUser } = useUserStore();
  const { handleLogout } = useLogout();

  const onLogOut = async () => {
    await handleLogout();
    navigation?.navigate("LoginScreen");
  };

  return (
    <ScrollView
      style={[spacing.pdBottomBar, spacing.pdStatusBar]}
      contentContainerStyle={[layout.flex1, spacing.gap20, spacing.pdLg]}
    >
      <ProfileHeading navigation={navigation} route={route} />

      <UserDetailContainer
        label="שם מלא"
        value={`${currentUser?.firstName} ${currentUser?.lastName}`}
      />
      <UserDetailContainer label="מייל" value={currentUser?.email || ``} />
      <UserDetailContainer label="טלפון" value={currentUser?.phone || ``} />
      <UserDetailContainer label="סוג תוכנית" value={currentUser?.planType || ``} />
      <UserDetailContainer
        label="תאריך הצטרפות"
        value={new Date(currentUser?.dateJoined || ``).toLocaleDateString()}
      />
      <UserDetailContainer
        label="תאריך סיום"
        value={new Date(currentUser?.dateFinished || ``).toLocaleDateString()}
      />
      <PrimaryButton block mode="light" onPress={onLogOut}>
        <Text fontVariant="bold">התנתק</Text>
      </PrimaryButton>
    </ScrollView>
  );
};

export default ProfileScreen;
