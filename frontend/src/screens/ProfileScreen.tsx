import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import useLogout from "@/hooks/useLogout";
import { Text } from "@/components/ui/Text";
import { AuthStackParamListNavigationProp } from "@/types/navigatorTypes";
import ProfileHeading from "@/components/User/ProfileHeading";
import UserDetailsWrapper from "@/components/User/UserDetailsWrapper";
import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomScrollView from "@/components/ui/scrollview/CustomScrollView";

const ProfileScreen = () => {
  const { layout, spacing } = useStyles();
  const { handleLogout } = useLogout();

  const navigation = useNavigation<AuthStackParamListNavigationProp>();

  const onLogOut = async () => {
    await handleLogout();
    navigation?.navigate("LoginScreen");
  };

  return (
    <View style={[layout.flex1, { paddingTop: 48 }, spacing.pdBottomBar]}>
      <CustomScrollView topShadow={false}>
        <View style={[{ marginBottom: 30 }]}>
          <ProfileHeading />
        </View>
        <UserDetailsWrapper />
        <View style={spacing.pdHorizontalLg}>
          <PrimaryButton style={{ marginTop: 20 }} block mode="light" onPress={onLogOut}>
            <Text fontVariant="bold">התנתק</Text>
          </PrimaryButton>
        </View>
      </CustomScrollView>
    </View>
  );
};

export default ProfileScreen;
