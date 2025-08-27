import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React, { useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "../Icon/Icon";
import { ConditionalRender } from "../ui/ConditionalRender";
import { useUserStore } from "@/store/userStore";
import { ProfileScreenProps } from "@/screens/ProfileScreen";
import UploadDrawer from "../ui/UploadDrawer";
import { useUserApi } from "@/hooks/api/useUserApi";

const ICON_SIZE = 30;
const HALF_OF_ICON_SIZE = 15;

const ProfileHeading: React.FC<ProfileScreenProps> = ({ navigation, route }) => {
  const { colors, common, layout } = useStyles();
  const { currentUser } = useUserStore();
  const { width } = useWindowDimensions();
  const {} = useUserApi();

  const [profileHeight, setProfileHeight] = useState(0);

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

  const onUpload = () => {};

  return (
    <View style={[layout.flex1, layout.center, { position: "relative" }]}>
      <TouchableOpacity
        onPress={() => navigation?.navigate(route?.params?.navigatedFrom as any)}
        style={styles.backButton}
      >
        <Icon name="chevronRightBig" />
      </TouchableOpacity>
      <View
        style={[
          colors.backgroundSurface,
          layout.flex1,
          common.roundedMd,
          { width: width * 0.4, position: "relative" },
        ]}
        onLayout={handleLayoutChange}
      >
        <ConditionalRender condition={currentUser?.profileImage}>
          <Image
            src="https://miro.medium.com/v2/resize:fit:2400/1*Mw1Yhy3Z3TiV0mZkF4UInw.jpeg" //temporary
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
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: { position: "absolute", top: 0, start: 0 },
});

export default ProfileHeading;
