import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "../ui/ConditionalRender";
import { useUserStore } from "@/store/userStore";
import UploadDrawer from "../ui/UploadDrawer";
import { useUserApi } from "@/hooks/api/useUserApi";
import { useToast } from "@/hooks/useToast";
import { buildPhotoUrl } from "@/utils/utils";
import { RootStackParamListNavigationProp } from "@/types/navigatorTypes";
import { useNavigation } from "@react-navigation/native";

const ICON_SIZE = 30;
const HALF_OF_ICON_SIZE = ICON_SIZE / 2;

const ProfileHeading = () => {
  const { colors, common, layout } = useStyles();
  const { currentUser } = useUserStore();
  const { width, height } = useWindowDimensions();
  const { updateProfilePhoto } = useUserApi();
  const { triggerErrorToast } = useToast();
  const navigation = useNavigation<RootStackParamListNavigationProp>();

  const [profileHeight, setProfileHeight] = useState(0);
  const [loading, setLoading] = useState(false);

  const { iconEndPosition, iconTopPosition } = useMemo(() => {
    const iconTopPosition = profileHeight / 2 - HALF_OF_ICON_SIZE;
    const iconEndPosition = -HALF_OF_ICON_SIZE;

    return { iconEndPosition, iconTopPosition };
  }, [profileHeight]);

  const handleLayoutChange = (e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;

    if (profileHeight == height) return;

    setProfileHeight(height);
  };

  const onUpload = async (images: string[]) => {
    const profileImage = images[0];

    if (!profileImage) return;

    try {
      setLoading(true);

      await updateProfilePhoto(profileImage);
    } catch (error: any) {
      triggerErrorToast({ message: error.response.body.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[layout.flex1, layout.center, { position: "relative" }]}>
      <TouchableOpacity
        onPress={() => navigation?.navigate("BottomTabs", { screen: "Home" })}
        style={styles.backButton}
      >
        <Icon name="chevronRightBig" />
      </TouchableOpacity>
      <View
        style={[
          colors.backgroundSurface,
          common.roundedMd,
          { width: width * 0.4, height: height * 0.2, position: "relative" },
        ]}
        onLayout={handleLayoutChange}
      >
        <ConditionalRender condition={currentUser?.profileImage}>
          <Image
            src={buildPhotoUrl(currentUser?.profileImage || "")}
            style={[layout.sizeFull, common.roundedMd]}
          />
        </ConditionalRender>

        <UploadDrawer
          trigger={
            <TouchableOpacity
              style={[{ position: "absolute", end: iconEndPosition, top: iconTopPosition }]}
            >
              <Icon name="edit" height={ICON_SIZE} width={ICON_SIZE} />
            </TouchableOpacity>
          }
          imageCap={1}
          handleUpload={onUpload}
          loading={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: { position: "absolute", top: 0, start: 0 },
});

export default ProfileHeading;
