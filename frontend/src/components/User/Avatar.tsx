import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { useUserStore } from "@/store/userStore";
import { ConditionalRender } from "../ui/ConditionalRender";
import { RootStackParamListNavigationProp } from "@/types/navigatorTypes";
import { useNavigation } from "@react-navigation/native";
import { buildPhotoUrl } from "@/utils/utils";

const Avatar = () => {
  const { colors, common, fonts, layout } = useStyles();
  const { currentUser } = useUserStore();
  const navigation = useNavigation<RootStackParamListNavigationProp>();

  const firstNameInitial = currentUser?.firstName.charAt(0).toUpperCase();

  return (
    <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
      <ConditionalRender condition={!currentUser?.profileImage}>
        <View
          style={[
            layout.center,
            colors.backgroundSecondary,
            common.roundedFull,
            common.borderXsm,
            colors.outline,
            styles.avatar,
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
          style={[styles.avatar, common.roundedFull]}
        />
      </ConditionalRender>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  avatar: {
    height: 36,
    width: 36,
  },
});

export default Avatar;
