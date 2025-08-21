import { TouchableOpacity, View, useWindowDimensions } from "react-native";

import useStyles from "@/styles/useGlobalStyles";
import NativeIcon from "@/components/Icon/NativeIcon";
import { useUserDrawer } from "@/store/userDrawerStore";
import { useUserStore } from "@/store/userStore";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import { ConditionalRender } from "@/components/ui/ConditionalRender";

export default function TopBar() {
  const { colors, layout, spacing, common, fonts, text } = useStyles();
  const { height } = useWindowDimensions();
  const { setOpenUserDrawer } = useUserDrawer();
  const { currentUser } = useUserStore();

  return (
    <View
      style={[
        { paddingTop: spacing.pdStatusBar.paddingTop! + 5 },
        layout.itemsCenter,
        layout.justifyBetween,
        layout.flexRow,
        spacing.pdHorizontalLg,
        {
          height: height * 0.12,
          borderBottomWidth: 0.25,
          borderBottomColor: colors.borderBackground.borderColor,
        },
      ]}
    >
      <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
        <ConditionalRender condition={!currentUser?.profileImage}>
          <View
            style={[
              layout.center,
              colors.backgroundSecondary,
              common.roundedFull,
              spacing.pdHorizontalMd,
              spacing.pdVerticalXs,
            ]}
          >
            <Text fontVariant="bold" style={fonts.lg}>
              {currentUser?.firstName.charAt(0)}
            </Text>
          </View>
        </ConditionalRender>

        <Text style={fonts.lg}>ברוך הבא {currentUser?.firstName}</Text>
      </View>

      <TouchableOpacity style={{ position: "relative" }}>
        <Icon name="bell" height={30} width={30} />

        <View
          style={[
            layout.center,
            common.roundedFull,
            {
              backgroundColor: "#95FDA8",
              position: "absolute",
              paddingHorizontal: 5,
              top: -5,
            },
          ]}
        >
          <Text fontVariant="bold">2</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
