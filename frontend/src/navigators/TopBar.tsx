import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useUserStore } from "@/store/userStore";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import Avatar from "@/components/User/Avatar";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamListNavigationProp } from "@/types/navigatorTypes";

export default function TopBar() {
  const { colors, layout, spacing, common, fonts } = useStyles();
  const { height } = useWindowDimensions();
  const { currentUser } = useUserStore();
  const navigation = useNavigation<RootStackParamListNavigationProp>();

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
          paddingTop: spacing.pdStatusBar.paddingTop! + 5,
        },
      ]}
    >
      <View style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
        <Avatar />

        <Text style={fonts.lg}>ברוך הבא {currentUser?.firstName}</Text>
      </View>

      <TouchableOpacity
        style={{ position: "relative" }}
        onPress={() => navigation.navigate("NotificationScreen")}
      >
        <Icon name="bell" height={30} width={30} />

        <View style={[layout.center, common.roundedFull, styles.notificationBadge]}>
          <Text fontVariant="bold">2</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationBadge: {
    backgroundColor: "#95FDA8",
    position: "absolute",
    paddingHorizontal: 5,
    top: -5,
  },
});
