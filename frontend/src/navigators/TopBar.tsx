import { View, useWindowDimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useUserStore } from "@/store/userStore";
import { Text } from "@/components/ui/Text";
import Avatar from "@/components/User/Avatar";
import NotificationsWrapper from "@/components/notifications/NotificationsWrapper";

export default function TopBar() {
  const { colors, layout, spacing, fonts } = useStyles();
  const { height } = useWindowDimensions();
  const { currentUser } = useUserStore();

  return (
    <View
      style={[
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
      <View style={[layout.flexRow, layout.itemsCenter, { gap: 10 }]}>
        <Avatar />

        <Text fontSize={16} fontVariant="light" style={fonts.lg}>
          ברוך הבא {currentUser?.firstName}
        </Text>
      </View>

      <NotificationsWrapper />
    </View>
  );
}
