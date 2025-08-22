import { Image, TouchableOpacity, View } from "react-native";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { useUserStore } from "@/store/userStore";
import { ConditionalRender } from "../ui/ConditionalRender";

const Avatar = () => {
  const { colors, common, fonts, layout } = useStyles();
  const { currentUser } = useUserStore();

  const firstNameInitial = currentUser?.firstName.charAt(0).toUpperCase();
  const avatarSizeStyle = {
    height: fonts.xxl.fontSize,
    width: fonts.xxl.fontSize,
  };

  return (
    <TouchableOpacity>
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
          src="https://miro.medium.com/v2/resize:fit:2400/1*Mw1Yhy3Z3TiV0mZkF4UInw.jpeg"
          style={[avatarSizeStyle, common.roundedFull]}
        />
      </ConditionalRender>
    </TouchableOpacity>
  );
};

/* const styles = StyleSheet.create({
  avatarSize: {
    height: 30,
    width: 30,
  },
}); */

export default Avatar;
