import { Image, TouchableOpacity, View } from "react-native";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { useUserStore } from "@/store/userStore";
import { ConditionalRender } from "../ui/ConditionalRender";
import { RootStackParamList, RootStackParamListNavigationProp } from "@/types/navigatorTypes";
import { useNavigation, useNavigationState, useRoute } from "@react-navigation/native";
import { buildPhotoUrl } from "@/utils/utils";

const Avatar = () => {
  const { colors, common, fonts, layout } = useStyles();
  const { currentUser } = useUserStore();
  const navigation = useNavigation<RootStackParamListNavigationProp>();
  const route = useRoute();

  const firstNameInitial = currentUser?.firstName.charAt(0).toUpperCase();
  const avatarSizeStyle = {
    height: fonts.xxxl.fontSize,
    width: fonts.xxxl.fontSize,
  };

  const activeTab = useNavigationState((state) => {
    const tabState = state.routes.find((r) => r.name === "BottomTabs")?.state;
    if (tabState && "index" in tabState && tabState.routeNames) {
      return tabState.routeNames[tabState.index as number];
    }
    return undefined;
  });

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Profile", { navigatedFrom: activeTab || "" })}
    >
      <ConditionalRender condition={!currentUser?.profileImage}>
        <View
          style={[
            layout.center,
            colors.backgroundSecondary,
            common.roundedFull,
            common.borderXsm,
            colors.outline,
            avatarSizeStyle,
          ]}
        >
          <Text fontVariant="bold" style={fonts.lg}>
            {firstNameInitial}
          </Text>
        </View>
      </ConditionalRender>

      <ConditionalRender condition={currentUser?.profileImage}>
        <Image
          src={buildPhotoUrl(currentUser?.profileImage || "")}
          style={[avatarSizeStyle, common.roundedFull]}
        />
      </ConditionalRender>
    </TouchableOpacity>
  );
};

export default Avatar;
