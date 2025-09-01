import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import useLogout from "@/hooks/useLogout";
import { Text } from "@/components/ui/Text";
import { RootStackParamListNavigationProp } from "@/types/navigatorTypes";
import ProfileHeading from "@/components/User/ProfileHeading";
import UserDetailsWrapper from "@/components/User/UserDetailsWrapper";
import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const { layout, spacing } = useStyles();
  const { handleLogout } = useLogout();

  const navigation = useNavigation<RootStackParamListNavigationProp>();

  const onLogOut = async () => {
    await handleLogout();
    navigation?.navigate("LoginScreen");
  };

  return (
    <View style={[layout.flex1, { paddingTop: 48 }, spacing.pdBottomBar, spacing.pdHorizontalLg]}>
      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <View style={[{ marginBottom: 30 }]}>
          <ProfileHeading />
        </View>
        <UserDetailsWrapper />
        <PrimaryButton style={[{ marginTop: 20 }]} block mode="light" onPress={onLogOut}>
          <Text fontVariant="bold">התנתק</Text>
        </PrimaryButton>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
